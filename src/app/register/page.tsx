'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [joiningReason, setJoiningReason] = useState('explore')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (password !== confirmPassword) {
            setError("Passwords don't match")
            setLoading(false)
            return
        }

        const supabase = createClient()

        // Sign up the user
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
                data: {
                    full_name: email.split('@')[0], // Default name
                }
            },
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        if (data.user) {
            // Update profile with joining reason
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ joining_reason: joiningReason })
                .eq('id', data.user.id)

            if (profileError) {
                console.error('Error updating profile reason:', profileError)
            }

            // Create application record
            const { error: appError } = await supabase
                .from('applications')
                .insert([
                    {
                        name: email.split('@')[0],
                        email: email,
                        message: `New member registration - Joining as: ${joiningReason}`,
                        status: 'pending',
                    },
                ])

            if (appError) {
                console.error('Error creating application:', appError)
            }

            // Send welcome email to member
            try {
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'welcome',
                        data: {
                            name: email.split('@')[0],
                            email: email,
                            isActive: false,
                        },
                    }),
                })
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError)
            }

            // Send admin notification email
            try {
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'application',
                        data: {
                            name: email.split('@')[0],
                            email: email,
                            message: `New member registration - Joining as: ${joiningReason}`,
                            id: data.user.id,
                        },
                    }),
                })
            } catch (emailError) {
                console.error('Failed to send admin notification:', emailError)
            }

            router.push('/dashboard')
            router.refresh()
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
                    <h1 className="font-serif text-3xl font-semibold mb-2">Join the Collective</h1>
                    <p className="text-[var(--color-text-muted)]">Create your member account</p>
                </div>

                {/* Register Form */}
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 backdrop-blur-[10px]">
                    <form onSubmit={handleRegister} className="space-y-6">
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

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium mb-2">
                                I am mainly here to...
                            </label>
                            <div className="relative">
                                <select
                                    id="reason"
                                    value={joiningReason}
                                    onChange={(e) => setJoiningReason(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] appearance-none cursor-pointer"
                                >
                                    <option value="explore">Just Exploring</option>
                                    <option value="learn">Learn & Up-skill</option>
                                    <option value="buy">Find Tools/Services</option>
                                    <option value="partner">Partner/Collaborate</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
                                    ▼
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-br from-[var(--color-accent-blue)] to-[#2563eb] text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)' }}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>

                        <div className="text-center text-sm">
                            <span className="text-[var(--color-text-muted)]">Already have an account? </span>
                            <Link href="/login" className="text-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue-light)] transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
