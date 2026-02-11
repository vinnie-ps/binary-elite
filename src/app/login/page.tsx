'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const supabase = createClient()

        const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (loginError) {
            setError(loginError.message)
            setLoading(false)
            return
        }

        if (data.user) {
            router.refresh() // Ensure server sees the new cookie

            // Check if user is admin key
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            const redirect = searchParams.get('redirect')

            if (profile?.role === 'admin') {
                // If admin, prioritize admin dashboard
                if (redirect && redirect.startsWith('/admin')) {
                    router.push(redirect)
                } else {
                    router.push('/admin')
                }
            } else {
                router.push(redirect || '/dashboard')
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-dark)] px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <div className="w-20 h-20 mx-auto rounded-2xl border-2 border-[var(--color-accent-blue)] flex items-center justify-center bg-[rgba(15,15,25,0.5)] backdrop-blur-[10px] mb-6"
                            style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)' }}>
                            <div className="font-serif text-4xl font-bold text-[var(--color-accent-blue)]"
                                style={{ textShadow: '0 0 15px var(--color-accent-blue-glow)' }}>
                                BE
                            </div>
                        </div>
                    </Link>
                    <h1 className="font-serif text-3xl font-semibold mb-2">Welcome Back</h1>
                    <p className="text-[var(--color-text-muted)]">Sign in to your account</p>
                </div>

                {/* Login Form */}
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 backdrop-blur-[10px]">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-br from-[var(--color-accent-blue)] to-[#2563eb] text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)' }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="text-center text-sm">
                            <span className="text-[var(--color-text-muted)]">Don't have an account? </span>
                            <Link href="/register" className="text-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue-light)] transition-colors">
                                Register now
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
