'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Bell, Shield, CreditCard, Mail, Lock, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [currentTier, setCurrentTier] = useState<any>(null)

    // Form States
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Notification States
    const [notifications, setNotifications] = useState({
        marketing: true,
        security: true,
        updates: false
    })

    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)
            setEmail(user.email || '')

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                // Protect Route: If not active, redirect to dashboard
                if (profile.status !== 'active') {
                    router.push('/dashboard')
                    return
                }

                setProfile(profile)
                // Initialize notifications from DB profile
                // Using nullish coalescing to default to true/false if column is null
                setNotifications({
                    marketing: profile.notify_marketing ?? true,
                    security: profile.notify_security ?? true,
                    updates: profile.notify_updates ?? false
                })

                // Fetch Tier Details
                if (profile.billing_plan) {
                    const { data: tierData } = await supabase
                        .from('subscription_tiers')
                        .select('*')
                        .eq('name', profile.billing_plan)
                        .single()

                    if (tierData) setCurrentTier(tierData)
                }
            }
            setLoading(false)
        }
        getUser()
    }, [router])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const updates: any = {}
            if (email !== user.email) updates.email = email
            if (password) {
                if (password !== confirmPassword) throw new Error("Passwords do not match")
                updates.password = password
            }

            if (Object.keys(updates).length > 0) {
                const { error } = await supabase.auth.updateUser(updates)
                if (error) throw error
                setMessage({ type: 'success', text: 'Account settings updated successfully. Check your email if you changed it.' })
                setPassword('')
                setConfirmPassword('')
            } else {
                setMessage({ type: 'success', text: 'No changes to save.' })
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setSaving(false)
        }
    }

    const toggleNotification = async (key: keyof typeof notifications) => {
        // Optimistic UI update
        const newVal = !notifications[key]
        setNotifications(prev => ({ ...prev, [key]: newVal }))

        // Save to DB
        // Map UI keys to DB columns
        const dbColumn = key === 'marketing' ? 'notify_marketing'
            : key === 'security' ? 'notify_security'
                : 'notify_updates' // partner requests

        const { error } = await supabase
            .from('profiles')
            .update({ [dbColumn]: newVal })
            .eq('id', user.id)

        if (error) {
            console.error('Error updating notification preference:', error)
            // Revert on error
            setNotifications(prev => ({ ...prev, [key]: !newVal }))
            setMessage({ type: 'error', text: 'Failed to update preference.' })
        }
        // We do NOT set a success message here to avoid spamming the user
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent-blue)]" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] px-4 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/dashboard" className="text-sm text-[var(--color-text-muted)] hover:text-white mb-2 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="font-serif text-3xl font-semibold">Settings</h1>
                        <p className="text-[var(--color-text-muted)]">Manage your account preferences and security.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN - Navigation/Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Plan Card */}
                        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-green-400" />
                                </div>
                                <h3 className="font-bold">Current Plan</h3>
                            </div>
                            <div className={`p-3 border rounded-lg text-center mb-4 ${profile?.billing_status === 'active'
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                }`}>
                                <span className="uppercase text-xs font-bold tracking-wider">
                                    {currentTier ? currentTier.display_name : (profile?.billing_plan || 'Free')} Plan
                                </span>
                                {profile?.billing_status && profile.billing_status !== 'active' && (
                                    <div className="text-[10px] opacity-80 mt-1 uppercase">
                                        ({profile.billing_status.replace('_', ' ')})
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] mb-4">
                                {profile?.billing_plan === 'free'
                                    ? 'Upgrade to access exclusive features.'
                                    : 'Your membership is active. You have full access.'}
                            </p>
                            {currentTier && currentTier.price_monthly > 0 && (
                                <div className="flex justify-between items-center text-sm mb-4 p-2 bg-[var(--color-bg-darker)] rounded">
                                    <span className="text-xs text-[var(--color-text-muted)]">Monthly Rate</span>
                                    <span className="font-mono text-white">${currentTier.price_monthly}</span>
                                </div>
                            )}
                            {currentTier && currentTier.price_monthly > 0 && (
                                <div className="flex justify-between items-center text-sm mb-4 p-2 bg-[var(--color-bg-darker)] rounded">
                                    <span className="text-xs text-[var(--color-text-muted)]">Monthly Rate</span>
                                    <span className="font-mono text-white">${currentTier.price_monthly}</span>
                                </div>
                            )}
                            <button disabled className="w-full py-2 text-sm border border-[var(--color-border)] rounded-lg opacity-50 cursor-not-allowed">
                                Manage Billing (Coming Soon)
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Forms */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Success/Error Message */}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                                    }`}
                            >
                                {message.text}
                            </motion.div>
                        )}

                        {/* Account Security */}
                        <section className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="w-5 h-5 text-[var(--color-accent-blue)]" />
                                <h2 className="text-xl font-semibold">Account Security</h2>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-[var(--color-text-muted)]" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                    />
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                        Changing your email will require re-verification.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-[var(--color-text-muted)]" />
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Leave blank to keep current"
                                            className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2 bg-[var(--color-accent-blue)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Notifications */}
                        <section className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Bell className="w-5 h-5 text-purple-400" />
                                <h2 className="text-xl font-semibold">Notifications</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-[var(--color-bg-darker)] rounded-lg">
                                    <div>
                                        <h3 className="font-medium">Product Updates</h3>
                                        <p className="text-xs text-[var(--color-text-muted)]">Receive news about new features and improvements.</p>
                                    </div>
                                    <button
                                        onClick={() => toggleNotification('marketing')}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${notifications.marketing ? 'bg-[var(--color-accent-blue)]' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications.marketing ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[var(--color-bg-darker)] rounded-lg">
                                    <div>
                                        <h3 className="font-medium">Security Alerts</h3>
                                        <p className="text-xs text-[var(--color-text-muted)]">Get notified about significant account activity.</p>
                                    </div>
                                    <button
                                        onClick={() => toggleNotification('security')}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${notifications.security ? 'bg-[var(--color-accent-blue)]' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications.security ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[var(--color-bg-darker)] rounded-lg">
                                    <div>
                                        <h3 className="font-medium">Partner Requests</h3>
                                        <p className="text-xs text-[var(--color-text-muted)]">Notify me when members want to collaborate on my projects.</p>
                                    </div>
                                    <button
                                        onClick={() => toggleNotification('updates')}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${notifications.updates ? 'bg-[var(--color-accent-blue)]' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications.updates ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    )
}
