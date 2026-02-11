'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Calendar, Newspaper, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type Post = {
    id: string
    title: string
    content: string
    image_url: string | null
    created_at: string
}

export default function NewsPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchNews = async () => {
            const { data } = await supabase
                .from('posts')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false })

            if (data) setPosts(data)
            setLoading(false)
        }
        fetchNews()
    }, [])

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
                <div className="mb-8">
                    <Link href="/dashboard" className="text-sm text-[var(--color-text-muted)] hover:text-white mb-2 inline-flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Newspaper className="w-8 h-8 text-[var(--color-accent-blue)]" />
                        </div>
                        <div>
                            <h1 className="font-serif text-3xl font-bold">Latest News</h1>
                            <p className="text-[var(--color-text-muted)]">Announcements and updates from the team.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {posts.map((post, idx) => (
                        <motion.article
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={post.id}
                            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            {post.image_url && (
                                <div className="h-48 md:h-64 overflow-hidden">
                                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-3">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(post.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                                <h2 className="text-2xl font-bold mb-4 font-serif">{post.title}</h2>
                                <div className="prose prose-invert prose-sm max-w-none text-[var(--color-text-secondary)]">
                                    {post.content.split('\n').map((para, i) => (
                                        <p key={i} className="mb-4">{para}</p>
                                    ))}
                                </div>
                            </div>
                        </motion.article>
                    ))}

                    {posts.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-2xl">
                            <Newspaper className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-[var(--color-text-secondary)]">No news yet</h3>
                            <p className="text-sm text-[var(--color-text-muted)]">Check back later for updates.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
