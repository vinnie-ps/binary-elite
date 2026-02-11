'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { LayoutDashboard, FolderKanban, Sparkles, Settings, FileText, LogOut, Menu, X, User, Mail } from 'lucide-react'
import { NotificationBell } from '@/components/ui/NotificationBell'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
        { name: 'Features', href: '/admin/features', icon: Sparkles },
        { name: 'News', href: '/admin/news', icon: FileText }, // Reusing FileText or specialized icon
        { name: 'Resources', href: '/admin/resources', icon: FolderKanban }, // Reusing FolderKanban or similar
        { name: 'Tools', href: '/admin/tools', icon: Settings },
        { name: 'Classes', href: '/admin/classes', icon: FileText },
        { name: 'Members', href: '/admin/members', icon: User },
        { name: 'Messages', href: '/admin/messages', icon: Mail },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
        { name: 'Applications', href: '/admin/applications', icon: FileText },
    ]

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)]">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] sticky top-0 z-30">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg border border-[var(--color-accent-blue)] flex items-center justify-center bg-[rgba(15,15,25,0.5)]">
                        <span className="font-serif text-lg font-bold text-[var(--color-accent-blue)]">BE</span>
                    </div>
                    <span className="font-serif text-lg font-semibold">Binary Elite</span>
                </Link>
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 text-[var(--color-text-primary)] hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-colors"
                    >
                        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 w-64 bg-[var(--color-bg-card)] border-r border-[var(--color-border)] backdrop-blur-[10px] z-50 transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo (Desktop only) */}
                    <div className="hidden md:block p-6 border-b border-[var(--color-border)]">
                        <div className="flex items-center justify-between mb-3">
                            <Link href="/admin" className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl border-2 border-[var(--color-accent-blue)] flex items-center justify-center bg-[rgba(15,15,25,0.5)]"
                                    style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}>
                                    <span className="font-serif text-2xl font-bold text-[var(--color-accent-blue)]">BE</span>
                                </div>
                                <div>
                                    <h2 className="font-serif text-lg font-semibold">Binary Elite</h2>
                                    <p className="text-xs text-[var(--color-text-muted)]">Admin Portal</p>
                                </div>
                            </Link>
                            <NotificationBell />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-[var(--color-accent-blue)] text-white'
                                        : 'text-[var(--color-text-secondary)] hover:bg-[rgba(59,130,246,0.1)] hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-[var(--color-border)]">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[var(--color-text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="md:pl-64 transition-all duration-300">
                <main className="p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
