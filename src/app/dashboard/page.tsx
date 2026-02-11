'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User, Settings, Bell, Lock, AlertCircle, Zap, Wrench, BookOpen, ExternalLink, Mail } from 'lucide-react'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Database } from '@/lib/supabase/types'

// Define types locally for now (until types are regenerated)
type Profile = {
    id: string
    full_name: string | null
    status: string
    joining_reason: string | null
    billing_plan?: string
    billing_status?: string
}

type Tool = {
    id: string
    title: string
    description: string
    price: string
    link: string
    image_url: string
    visibility: 'public' | 'member' | 'hidden'
}

type Class = {
    id: string
    title: string
    description: string
    instructor: string
    status: string
    link: string
    image_url: string
    visibility: 'public' | 'member' | 'hidden'
}

type FeatureCard = Database['public']['Tables']['feature_cards']['Row']
type Project = Database['public']['Tables']['projects']['Row']

export default function DashboardPage() {
    const router = useRouter()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    // Dynamic Data State
    const [memberFeatures, setMemberFeatures] = useState<FeatureCard[]>([])
    const [memberProjects, setMemberProjects] = useState<Project[]>([])
    const [tools, setTools] = useState<Tool[]>([])
    const [classes, setClasses] = useState<Class[]>([])
    const [currentTier, setCurrentTier] = useState<any>(null)

    useEffect(() => {
        const supabase = createClient()
        const fetchAllData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // 1. Fetch Profile
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error || !profileData) {
                console.log('Session mismatch detected. Redirecting to login...')
                await supabase.auth.signOut()
                router.push('/login')
                return
            }

            setProfile(profileData)

            // 2. Fetch Current Tier Details
            if (profileData.billing_plan) {
                const { data: tierData } = await supabase
                    .from('subscription_tiers')
                    .select('*')
                    .eq('name', profileData.billing_plan)
                    .single()

                if (tierData) setCurrentTier(tierData)
            }

            // 3. Fetch Content based on Joining Reason
            const reason = profileData.joining_reason

            // ... (rest of the fetching logic) ...

            // Logic Table:
            // learn -> Classes
            // buy -> Tools, Projects
            // partner -> Projects
            // explore -> Everything

            const shouldFetchClasses = reason === 'learn' || reason === 'explore'
            const shouldFetchTools = reason === 'buy' || reason === 'explore'
            const shouldFetchProjects = reason === 'buy' || reason === 'partner' || reason === 'explore'
            const shouldFetchFeatures = reason === 'explore'

            // Fetch Classes
            if (shouldFetchClasses) {
                const { data } = await supabase.from('classes').select('*')
                if (data) setClasses(data as Class[])
            }

            // Fetch Tools
            if (shouldFetchTools) {
                const { data } = await supabase.from('tools').select('*')
                if (data) setTools(data as Tool[])
            }

            // Fetch Projects (Member Only + Public?)
            if (shouldFetchProjects) {
                const { data } = await supabase
                    .from('projects')
                    .select('*')
                    .or('visibility.eq.member,visibility.eq.public')
                    .eq('is_active', true)
                if (data) setMemberProjects(data)
            }

            // Fetch Features (Insights)
            if (shouldFetchFeatures) {
                const { data } = await supabase
                    .from('feature_cards')
                    .select('*')
                    .or('visibility.eq.member,visibility.eq.public')
                    .eq('is_active', true)
                if (data) setMemberFeatures(data)
            }

            setLoading(false)
        }
        fetchAllData()
    }, [router])

    // ... (rest of the component) ...



    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const isActive = profile?.status === 'active'
    const isExplorer = profile?.joining_reason === 'explore'

    // Disable interactions if Explorer (except Profile)
    // Disable interactions if Explorer (except Profile)
    const InteractionButton = ({ label, href, primary = false }: { label: string, href?: string, primary?: boolean }) => {
        if (isExplorer || !isActive) {
            return (
                <button disabled className={`px-4 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed flex items-center gap-2
                    ${primary ? 'bg-[var(--color-accent-blue)] text-white' : 'bg-[var(--color-bg-darker)] border border-[var(--color-border)]'}
                `}>
                    <Lock className="w-3 h-3" />
                    {label === "Enroll Now" || label === "Buy" || label === "View" ? "Locked" : label}
                </button>
            )
        }

        if (href) {
            return (
                <a href={href} target="_blank" rel="noreferrer" className={`px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity
                     ${primary ? 'bg-[var(--color-accent-blue)] text-white' : 'bg-[var(--color-bg-darker)] border border-[var(--color-border)] hover:bg-[var(--color-bg-card)]'}
                `}>
                    {label}
                </a>
            )
        }

        return (
            <button className={`px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity
                  ${primary ? 'bg-[var(--color-accent-blue)] text-white' : 'bg-[var(--color-bg-darker)] border border-[var(--color-border)] hover:bg-[var(--color-bg-card)]'}
             `}>
                {label}
            </button>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)]">
            {/* Navbar */}
            <nav className="border-b border-[var(--color-border)] bg-[rgba(15,15,25,0.8)] backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg border border-[var(--color-accent-blue)] flex items-center justify-center bg-[rgba(15,15,25,0.5)]">
                                <span className="font-serif text-xl font-bold text-[var(--color-accent-blue)]">BE</span>
                            </div>
                            <span className="font-serif text-lg font-semibold">Binary Elite</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-xs text-gray-300 capitalize">{profile?.joining_reason || 'Member'}</span>
                            </div>
                            <NotificationBell />
                            <div className="h-8 w-px bg-[var(--color-border)]" />
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="font-serif text-3xl font-semibold mb-2">
                        Welcome, {profile?.full_name || 'Member'}
                    </h1>
                    <p className="text-[var(--color-text-muted)]">
                        {isExplorer
                            ? "You are in Explorer Mode. Content is visible but actions are disabled."
                            : "Manage your journey and access exclusive resources."}
                    </p>
                </div>

                {/* Status Banner */}
                {!isActive && !isExplorer && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-start gap-4"
                    >
                        <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-yellow-500 font-semibold text-lg mb-2">Account Activation Pending</h3>
                            <p className="text-[var(--color-text-secondary)] mb-4">
                                You can browse the dashboard while we review your full membership application.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Account Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {/* Profile Card */}
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 backdrop-blur-[10px] hover:border-[var(--color-accent-blue)] transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                            <User className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-xl mb-2">My Profile</h3>
                        <p className="text-[var(--color-text-muted)] mb-4">
                            {profile?.joining_reason === 'partner' ? 'Manage your partner portfolio and details.' : 'Manage your personal information.'}
                        </p>
                        {isActive ? (
                            <Link href="/dashboard/profile" className="text-[var(--color-accent-blue)] text-sm font-medium hover:underline inline-flex items-center gap-1">
                                Edit Profile →
                            </Link>
                        ) : (
                            <span className="text-gray-500 text-sm font-medium cursor-not-allowed flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Edit Profile
                            </span>
                        )}
                    </div>

                    {/* Settings Card */}
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 backdrop-blur-[10px]">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                            <Settings className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-xl mb-2">Settings</h3>
                        <p className="text-[var(--color-text-muted)] mb-4">Configure your notification preferences and account security.</p>
                        {isActive ? (
                            <Link href="/dashboard/settings" className="text-[var(--color-accent-blue)] text-sm font-medium hover:underline inline-flex items-center gap-1">
                                Manage Settings →
                            </Link>
                        ) : (
                            <span className="text-gray-500 text-sm font-medium cursor-not-allowed flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Manage Settings
                            </span>
                        )}
                    </div>

                    {/* Messages Card */}
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 backdrop-blur-[10px] hover:border-[var(--color-accent-blue)] transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-xl mb-2">Messages</h3>
                        <p className="text-[var(--color-text-muted)] mb-4">Check your inbox and chat directly with support.</p>
                        {isActive ? (
                            <Link href="/dashboard/messages" className="text-[var(--color-accent-blue)] text-sm font-medium hover:underline inline-flex items-center gap-1">
                                Open Inbox →
                            </Link>
                        ) : (
                            <span className="text-gray-500 text-sm font-medium cursor-not-allowed flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Open Inbox
                            </span>
                        )}
                    </div>

                    {/* Quick Stats/Membership Card */}
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 backdrop-blur-[10px]">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="font-semibold text-xl mb-2">Membership</h3>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide border
                                ${profile?.billing_status === 'active' || isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}
                            `}>
                                {currentTier ? currentTier.display_name : (profile?.billing_plan ? `${profile.billing_plan} Plan` : profile?.status)}
                            </div>
                            {profile?.billing_status && profile.billing_status !== 'active' && (
                                <span className="text-[10px] text-yellow-500 uppercase font-bold">
                                    {profile.billing_status.replace('_', ' ')}
                                </span>
                            )}
                        </div>
                        <p className="text-[var(--color-text-muted)] text-sm mb-2">
                            {profile?.billing_plan === 'free'
                                ? 'Upgrade for more features.'
                                : isExplorer ? 'Explorer Mode Active' : 'Full Access Granted'}
                        </p>
                        {currentTier && currentTier.price_monthly > 0 && (
                            <div className="text-xs text-[var(--color-text-secondary)]">
                                Current Rate: <span className="text-white font-mono">${currentTier.price_monthly}/mo</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* CONTENT SECTIONS */}

                {/* 1. Member-Only Features (Insights) - Only for Explore */}
                {memberFeatures.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="w-6 h-6 text-[var(--color-accent-blue)]" />
                            <h2 className="font-serif text-2xl font-semibold">Member-Only Insights</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {memberFeatures.map(feature => (
                                <div key={feature.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 backdrop-blur-[10px] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 bg-[var(--color-accent-blue)] text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">
                                        Exclusive
                                    </div>
                                    <div className="mb-4">
                                        {feature.icon?.startsWith('http') ? (
                                            <img src={feature.icon} alt={feature.title} className="w-12 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="text-4xl">{feature.icon}</div>
                                        )}
                                    </div>
                                    <h3 className="font-serif text-xl font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-sm text-[var(--color-text-muted)]">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 1.5 News & Resources Quick Access */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {/* Latest News Widget */}
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 relative overflow-hidden group hover:border-[var(--color-accent-blue)] transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-[var(--color-accent-blue)]">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg">Latest News</h3>
                            </div>
                            <Link href="/dashboard/news" className="text-sm text-[var(--color-accent-blue)] hover:underline">View All</Link>
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)] mb-4">
                            Stay up to date with the latest announcements, features, and community updates.
                        </p>
                        <InteractionButton label="Read News" href="/dashboard/news" />
                    </div>

                    {/* Resource Library Widget */}
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Wrench className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg">Resource Library</h3>
                            </div>
                            <Link href="/dashboard/resources" className="text-sm text-purple-400 hover:underline">Browse All</Link>
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)] mb-4">
                            Access exclusive templates, guides, and tools to accelerate your journey.
                        </p>
                        <InteractionButton label="Access Library" href="/dashboard/resources" />
                    </div>
                </div>

                {/* 2. Classes (Learn & Explore) */}
                {classes.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <BookOpen className="w-6 h-6 text-green-400" />
                            <h2 className="font-serif text-2xl font-semibold">Learning & Workshops</h2>
                        </div>
                        <div className="space-y-4">
                            {classes.map(cls => (
                                <div key={cls.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg">{cls.title}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wide
                                                ${cls.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}
                                            `}>
                                                {cls.status}
                                            </span>
                                        </div>
                                        <p className="text-[var(--color-text-muted)] text-sm mb-2">{cls.description}</p>
                                        <div className="text-xs text-gray-500">Instructor: {cls.instructor || 'TBA'}</div>
                                    </div>
                                    <InteractionButton
                                        label={isExplorer ? "Locked" : cls.status === 'closed' ? "Closed" : "Enroll Now"}
                                        href={!isExplorer && cls.status !== 'closed' ? cls.link : undefined}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Tools (Buy & Explore) */}
                {tools.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <Wrench className="w-6 h-6 text-orange-400" />
                            <h2 className="font-serif text-2xl font-semibold">Tools & Resources</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {tools.map(tool => (
                                <div key={tool.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 hover:translate-y-[-2px] transition-transform flex flex-col">
                                    {tool.image_url && (
                                        <img src={tool.image_url} alt={tool.title} className="w-full h-32 object-cover rounded-lg mb-4 bg-gray-800" />
                                    )}
                                    <h3 className="font-bold mb-1">{tool.title}</h3>
                                    <p className="text-xs text-[var(--color-text-muted)] mb-3 line-clamp-2">{tool.description}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="font-mono text-sm text-[var(--color-accent-blue)]">{tool.price}</span>
                                        <InteractionButton label={isExplorer ? "Locked" : "Buy"} href={isExplorer ? undefined : tool.link} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. Projects (Buy, Partner, Explore) */}
                {memberProjects.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <Lock className="w-6 h-6 text-purple-400" />
                            <h2 className="font-serif text-2xl font-semibold">
                                {profile?.joining_reason === 'partner' ? 'Collaborate on Projects' : 'The Incubator'}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {memberProjects.map(project => (
                                <div key={project.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 flex gap-4 hover:border-purple-500/50 transition-all">
                                    <div className="flex-shrink-0">
                                        {project.icon?.startsWith('http') ? (
                                            <img src={project.icon} alt={project.title} className="w-12 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="text-4xl">{project.icon}</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-lg">{project.title}</h3>
                                            <div className="flex gap-2">
                                                <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                                                    {project.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-4">{project.description}</p>
                                        <div className="flex justify-end">
                                            <InteractionButton
                                                label={isExplorer ? "Locked" : "View"}
                                                href={!isExplorer && project.link ? project.link : undefined}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </main>
        </div>
    )
}
