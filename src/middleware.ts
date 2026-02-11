import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string, value: string, options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // IMPORTANT: precise getUser() is needed for secure environments
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) console.log('Middleware Auth Error:', authError.message)

    // 1. Admin Route Protection
    if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
        if (!user) {
            console.log('Middleware: No user found for /admin access. Redirecting to /admin/login')
            const loginUrl = new URL('/admin/login', request.url)
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Check Admin Role
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (error) console.error('Middleware Profile Fetch Error:', error)
        console.log(`Middleware: User ${user.email} role is '${profile?.role}'`)

        if (profile?.role !== 'admin') {
            console.log(`Middleware Block: User ${user.email} is not admin (${profile?.role}). Redirecting to /dashboard.`)
            // Redirect non-admins to member dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // 2. Member Dashboard Protection
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
            return NextResponse.redirect(loginUrl)
        }
        // Ideally we could check if status is active here too, but let's leave that to the page for better UX (pending message)
    }

    return response
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*'],
}
