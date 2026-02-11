import { createClient } from '@/lib/supabase/server'
import { FolderKanban, Sparkles, FileText, Eye, Settings, Users, DollarSign, Activity, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Get counts and data for charts
    const [projectsCount, featuresCount, applicationsCount, profilesCount, profilesData, applicationsData] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('feature_cards').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('created_at').order('created_at', { ascending: true }),
        supabase.from('applications').select('submitted_at').order('submitted_at', { ascending: true }),
    ])

    // Process Growth Data (Last 6 Months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        return {
            monthIndex: d.getMonth(),
            name: months[d.getMonth()],
            fullDate: d
        }
    })

    const growthData = last6Months.map(month => {
        // Count cumulative members up to the end of this month
        const members = profilesData.data?.filter(p => new Date(p.created_at) <= new Date(month.fullDate.getFullYear(), month.monthIndex + 1, 0)).length || 0

        // Count cumulative applications up to the end of this month
        const applications = applicationsData.data?.filter(a => new Date(a.submitted_at) <= new Date(month.fullDate.getFullYear(), month.monthIndex + 1, 0)).length || 0

        return {
            name: month.name,
            members,
            applications
        }
    })

    // Mock Revenue Data (Randomized for demo, replace with Stripe data later)
    const revenueData = [
        { name: 'Mon', revenue: Math.floor(Math.random() * 5000) + 1000 },
        { name: 'Tue', revenue: Math.floor(Math.random() * 5000) + 1000 },
        { name: 'Wed', revenue: Math.floor(Math.random() * 5000) + 1000 },
        { name: 'Thu', revenue: Math.floor(Math.random() * 5000) + 1000 },
        { name: 'Fri', revenue: Math.floor(Math.random() * 5000) + 1000 },
        { name: 'Sat', revenue: Math.floor(Math.random() * 5000) + 1000 },
        { name: 'Sun', revenue: Math.floor(Math.random() * 5000) + 1000 },
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="font-serif text-4xl font-semibold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Command Center
                    </h1>
                    <p className="text-[var(--color-text-muted)]">Real-time overview of Binary Elite performance.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    System Operational
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Members"
                    value={profilesCount.count || 0}
                    icon={<Users className="w-6 h-6" />}
                    color="blue"
                    trend={{ value: 12, label: 'vs last week' }}
                />
                <StatCard
                    title="Monthly Revenue"
                    value="$12,450"
                    icon={<DollarSign className="w-6 h-6" />}
                    color="green"
                    trend={{ value: 8.2, label: 'vs last month' }}
                />
                <StatCard
                    title="Active Projects"
                    value={projectsCount.count || 0}
                    icon={<FolderKanban className="w-6 h-6" />}
                    color="purple"
                    trend={{ value: -2, label: 'vs last month' }}
                />
                <StatCard
                    title="Conversion Rate"
                    value="3.2%"
                    icon={<Activity className="w-6 h-6" />}
                    color="pink"
                    trend={{ value: 0.5, label: 'vs last week' }}
                />
            </div>

            {/* Charts Section */}
            <AnalyticsCharts growthData={growthData} revenueData={revenueData} />

            {/* Quick Actions */}
            <div className="bg-[var(--color-bg-card)]/50 border border-[var(--color-border)] rounded-2xl p-6 backdrop-blur-xl">
                <h2 className="font-serif text-2xl font-semibold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-[var(--color-accent-blue)]" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a href="/admin/projects" className="group flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent-blue)] hover:bg-[rgba(59,130,246,0.05)] transition-all">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                            <FolderKanban className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Manage Projects</span>
                    </a>
                    <a href="/admin/features" className="group flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent-blue)] hover:bg-[rgba(59,130,246,0.05)] transition-all">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Manage Features</span>
                    </a>
                    <a href="/admin/news" className="group flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent-blue)] hover:bg-[rgba(59,130,246,0.05)] transition-all">
                        <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 transition-colors">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Post News</span>
                    </a>
                    <a href="/" target="_blank" className="group flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent-blue)] hover:bg-[rgba(59,130,246,0.05)] transition-all">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-400 group-hover:bg-green-500/20 transition-colors">
                            <Eye className="w-5 h-5" />
                        </div>
                        <span className="font-medium">View Live Site</span>
                    </a>
                </div>
            </div>
        </div>
    )
}
