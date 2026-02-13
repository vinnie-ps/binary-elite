'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Trash2, Star, Filter, MessageSquare, Award } from 'lucide-react'
import Image from 'next/image'

type Testimonial = {
    id: string
    content: string
    role: string | null
    rating: number
    is_approved: boolean
    is_featured: boolean
    created_at: string
    profiles: {
        full_name: string | null
        email: string
        profile_photo_url: string | null
    }
}

export default function AdminTestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('pending')

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('testimonials')
            .select(`
                *,
                profiles (
                    full_name,
                    email,
                    profile_photo_url
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching testimonials:', error)
        } else {
            setTestimonials(data as any || [])
        }
        setLoading(false)
    }

    const handleAction = async (id: string, action: 'approve' | 'feature' | 'reject' | 'delete') => {
        let updateData = {}

        switch (action) {
            case 'approve':
                updateData = { is_approved: true }
                break
            case 'feature':
                // To feature, it must also be approved
                const current = testimonials.find(t => t.id === id)
                updateData = { is_featured: !current?.is_featured, is_approved: true }
                break
            case 'reject':
                updateData = { is_approved: false, is_featured: false }
                break
            case 'delete':
                if (!confirm('Permanently delete this testimonial?')) return
                const { error } = await supabase.from('testimonials').delete().eq('id', id)
                if (!error) fetchData()
                return
        }

        const { error } = await supabase
            .from('testimonials')
            .update(updateData)
            .eq('id', id)

        if (!error) fetchData()
    }

    const filteredTestimonials = testimonials.filter(t => {
        if (filter === 'all') return true
        if (filter === 'pending') return !t.is_approved
        if (filter === 'approved') return t.is_approved && !t.is_featured
        if (filter === 'featured') return t.is_featured
        return true
    })

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-semibold mb-2">Testimonials</h1>
                    <p className="text-[var(--color-text-muted)]">Review and manage community success stories</p>
                </div>

                <div className="flex bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-1">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'pending' ? 'bg-[var(--color-bg-darker)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                    >
                        Pending ({testimonials.filter(t => !t.is_approved).length})
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'approved' ? 'bg-[var(--color-bg-darker)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setFilter('featured')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'featured' ? 'bg-[var(--color-bg-darker)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                    >
                        Featured
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-[var(--color-bg-darker)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                    >
                        All
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : filteredTestimonials.length === 0 ? (
                <div className="text-center py-12 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl border-dashed">
                    <p className="text-[var(--color-text-muted)]">No testimonials found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTestimonials.map((t) => (
                        <div key={t.id} className={`
                            bg-[var(--color-bg-card)] border rounded-xl p-6 relative group transition-all
                            ${t.is_featured ? 'border-[var(--color-accent-blue)] shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-[var(--color-border)]'}
                        `}>
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-bg-darker)] overflow-hidden">
                                        {t.profiles.profile_photo_url ? (
                                            <Image src={t.profiles.profile_photo_url} alt="Profile" width={40} height={40} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                                                N/A
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">{t.profiles.full_name || 'Unknown User'}</h3>
                                        <p className="text-xs text-[var(--color-text-muted)]">{t.role || 'Member'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-6">
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-4 hover:line-clamp-none transition-all">
                                    "{t.content}"
                                </p>
                            </div>

                            {/* Actions Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                                <div className="flex items-center gap-2">
                                    {t.is_approved ? (
                                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                                            <Check className="w-3 h-3" /> Approved
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleAction(t.id, 'approve')}
                                            className="flex items-center gap-1 text-xs px-3 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-full transition-colors"
                                        >
                                            <Check className="w-3 h-3" /> Approve
                                        </button>
                                    )}

                                    {t.is_approved && !t.is_featured && (
                                        <button
                                            onClick={() => handleAction(t.id, 'feature')}
                                            className="flex items-center gap-1 text-xs px-3 py-1 bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/20 rounded-full transition-colors"
                                        >
                                            <Award className="w-3 h-3" /> Feature
                                        </button>
                                    )}

                                    {t.is_featured && (
                                        <button
                                            onClick={() => handleAction(t.id, 'feature')}
                                            className="flex items-center gap-1 text-xs px-3 py-1 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-full transition-colors"
                                        >
                                            <Award className="w-3 h-3" /> Featured
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {t.is_approved && (
                                        <button
                                            onClick={() => handleAction(t.id, 'reject')}
                                            className="p-2 text-[var(--color-text-muted)] hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                            title="Unapprove/Reject"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleAction(t.id, 'delete')}
                                        className="p-2 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
