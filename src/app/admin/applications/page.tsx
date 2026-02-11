'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Filter, Search, FileText } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Application = Database['public']['Tables']['applications']['Row']

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')
    const [search, setSearch] = useState('')

    const supabase = createClient()

    useEffect(() => {
        fetchApplications()
    }, [filter])

    const fetchApplications = async () => {
        let query = supabase
            .from('applications')
            .select('*')
            .order('submitted_at', { ascending: false })

        if (filter !== 'all') {
            query = query.eq('status', filter)
        }

        const { data } = await query
        if (data) setApplications(data)
        setLoading(false)
    }

    const updateStatus = async (id: string, status: Application['status']) => {
        await supabase
            .from('applications')
            .update({ status, reviewed_at: new Date().toISOString() })
            .eq('id', id)

        fetchApplications()
    }

    const filteredApplications = applications.filter(
        (app) =>
            app.name.toLowerCase().includes(search.toLowerCase()) ||
            app.email.toLowerCase().includes(search.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
            reviewed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
            accepted: 'bg-green-500/20 text-green-400 border-green-500/50',
            rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
        }
        return colors[status] || colors.pending
    }

    if (loading) {
        return <div className="text-center py-12">Loading...</div>
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-4xl font-semibold mb-2">Applications</h1>
                <p className="text-[var(--color-text-muted)]">Review membership applications</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                    />
                </div>

                <div className="flex gap-2">
                    {['all', 'pending', 'reviewed', 'accepted', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-3 rounded-lg font-medium capitalize transition-all ${filter === status
                                    ? 'bg-[var(--color-accent-blue)] text-white'
                                    : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-accent-blue)]'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {filteredApplications.map((app) => (
                    <div
                        key={app.id}
                        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 backdrop-blur-[10px]"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-1">{app.name}</h3>
                                <p className="text-[var(--color-text-muted)] text-sm">{app.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded text-xs font-medium border ${getStatusColor(app.status)}`}>
                                    {app.status.toUpperCase()}
                                </span>
                                <span className="text-[var(--color-text-muted)] text-sm">
                                    {new Date(app.submitted_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                {app.message}
                            </p>
                        </div>

                        {app.notes && (
                            <div className="mb-4 p-3 bg-[var(--color-bg-darker)] rounded-lg">
                                <p className="text-sm text-[var(--color-text-muted)]">
                                    <strong>Notes:</strong> {app.notes}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={() => updateStatus(app.id, 'reviewed')}
                                disabled={app.status === 'reviewed'}
                                className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50"
                            >
                                Mark Reviewed
                            </button>
                            <button
                                onClick={() => updateStatus(app.id, 'accepted')}
                                disabled={app.status === 'accepted'}
                                className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg hover:bg-green-500/30 transition-all disabled:opacity-50"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => updateStatus(app.id, 'rejected')}
                                disabled={app.status === 'rejected'}
                                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))}

                {filteredApplications.length === 0 && (
                    <div className="text-center py-12 text-[var(--color-text-muted)]">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No applications found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
