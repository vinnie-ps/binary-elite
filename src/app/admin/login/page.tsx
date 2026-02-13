'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AdminLoginContent() {
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
            const redirect = searchParams.get('redirect') || '/admin'
            router.push(redirect)
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-dark)] px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto rounded-2xl border-2 border-[var(--color-accent-blue)] flex items-center justify-center bg-[rgba(15,15,25,0.5)] backdrop-blur-[10px] mb-6"
                        style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)' }}>
                        <div className="font-serif text-5xl font-bold text-[var(--color-accent-blue)]"
                            style={{ textShadow: '0 0 15px var(--color-accent-blue-glow)' }}>
                            BE
                        </div>
                    </div>
                    <h1 className="font-serif text-3xl font-semibold mb-2">Admin Portal</h1>
                    <p className="text-[var(--color-text-muted)]">Binary Elite Dashboard</p>
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
                                placeholder="admin@binaryelite.com"
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
                    </form>
                </div>

                <p className="text-center text-[var(--color-text-muted)] text-sm mt-6">
                    Secure admin access only
                </p>
            </div>
        </div>
    )
}

export default function AdminLogin() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center text-[var(--color-text-muted)]">Loading encryption keys...</div>}>
            <AdminLoginContent />
        </Suspense>
    )
}
