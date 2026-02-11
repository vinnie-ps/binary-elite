'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, FolderOpen, FileText, Video as VideoIcon, Link as LinkIcon, Lock, Download, ExternalLink, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type Resource = {
    id: string
    title: string
    description: string
    url: string
    type: 'pdf' | 'video' | 'link'
    category: string
    is_active: boolean
}

export default function ResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState<string>('') // 'active' or others
    const supabase = createClient()

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('status').eq('id', user.id).single()
                if (profile) setStatus(profile.status)
            }

            const { data } = await supabase
                .from('resources')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (data) setResources(data)
            setLoading(false)
        }
        init()
    }, [])

    const isActiveMember = status === 'active'

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="w-5 h-5" />
            case 'video': return <VideoIcon className="w-5 h-5" />
            default: return <LinkIcon className="w-5 h-5" />
        }
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
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link href="/dashboard" className="text-sm text-[var(--color-text-muted)] hover:text-white mb-2 inline-flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                            <FolderOpen className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="font-serif text-3xl font-bold">Resource Library</h1>
                            <p className="text-[var(--color-text-muted)]">Exclusive guides, templates, and tools for members.</p>
                        </div>
                    </div>
                </div>

                {!isActiveMember && (
                    <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3 text-yellow-500">
                        <Lock className="w-5 h-5" />
                        <p className="text-sm font-medium">Resources are locked until your account is activated.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((res, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={res.id}
                            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col justify-between hover:border-[var(--color-accent-blue)] transition-colors group"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg flex items-center justify-center
                                        ${res.type === 'pdf' ? 'bg-red-500/10 text-red-400'
                                            : res.type === 'video' ? 'bg-purple-500/10 text-purple-400'
                                                : 'bg-blue-500/10 text-blue-400'
                                        }
                                    `}>
                                        {getTypeIcon(res.type)}
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] bg-[var(--color-bg-darker)] px-2 py-1 rounded">
                                        {res.category}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">{res.title}</h3>
                                <p className="text-sm text-[var(--color-text-muted)] mb-4">{res.description}</p>
                            </div>

                            <div className="pt-4 border-t border-[var(--color-border)]">
                                {isActiveMember ? (
                                    <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2 bg-[var(--color-bg-darker)] hover:bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {res.type === 'pdf' ? (
                                            <>
                                                <Download className="w-4 h-4" /> Download PDF
                                            </>
                                        ) : (
                                            <>
                                                <ExternalLink className="w-4 h-4" /> Open {res.type === 'video' ? 'Video' : 'Link'}
                                            </>
                                        )}
                                    </a>
                                ) : (
                                    <button disabled className="flex items-center justify-center gap-2 w-full py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
                                        <Lock className="w-4 h-4" /> Locked
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {resources.length === 0 && (
                        <div className="col-span-full text-center py-12 text-[var(--color-text-muted)]">
                            No resources available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
