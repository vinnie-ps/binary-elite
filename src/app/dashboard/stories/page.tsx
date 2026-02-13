'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Star, Clock, CheckCircle, XCircle } from 'lucide-react'

type Testimonial = {
    id: string
    content: string
    role: string | null
    rating: number
    is_approved: boolean
    is_featured: boolean
    created_at: string
}

export default function MemberStoriesPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        content: '',
        role: '',
        rating: 5
    })

    const supabase = createClient()

    useEffect(() => {
        fetchTestimonials()
    }, [])

    const fetchTestimonials = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('testimonials')
            .select('*')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false })

        if (data) setTestimonials(data)
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('testimonials')
                .insert([{
                    profile_id: user.id,
                    content: formData.content,
                    role: formData.role || null, // Optional override
                    rating: formData.rating
                }])

            if (error) throw error

            setFormData({ content: '', role: '', rating: 5 })
            alert('Story submitted successfully! Once approved, it may be featured on our homepage.')
            fetchTestimonials()
        } catch (error: any) {
            console.error('Error submitting story:', error)
            alert(error.message || 'Error submitting story')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this story?')) return

        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting:', error)
            alert('Error deleting story')
        } else {
            fetchTestimonials()
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="font-serif text-3xl font-bold text-[var(--color-text-primary)]">My Success Stories</h1>
                <p className="text-[var(--color-text-secondary)] mt-2">Share your journey and achievements with the community.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submission Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 sticky top-24">
                        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-[var(--color-accent-blue)]" />
                            Write a New Story
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Role / Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Senior Developer @ TechCorp"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm"
                                />
                                <p className="text-xs text-[var(--color-text-muted)] mt-1">Optional override for your profile title</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Your Story</label>
                                <textarea
                                    rows={5}
                                    required
                                    placeholder="Tell us about your experience..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2 bg-[var(--color-accent-blue)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {submitting ? 'Submitting...' : 'Submit Story'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List of Stories */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-semibold text-lg">Your Submissions</h2>

                    {loading ? (
                        <p>Loading...</p>
                    ) : testimonials.length === 0 ? (
                        <div className="text-center py-12 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl border-dashed">
                            <p className="text-[var(--color-text-muted)]">No stories submitted yet.</p>
                        </div>
                    ) : (
                        testimonials.map((story) => (
                            <div key={story.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 relative group">
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    {story.is_featured ? (
                                        <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/20 font-medium">Featured</span>
                                    ) : story.is_approved ? (
                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20 font-medium">Approved</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/20 font-medium">Pending Review</span>
                                    )}
                                </div>

                                <div className="flex gap-1 mb-2">
                                    {[...Array(story.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>

                                <p className="text-[var(--color-text-secondary)] mb-4 text-sm leading-relaxed whitespace-pre-wrap">
                                    "{story.content}"
                                </p>

                                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-4 mt-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {new Date(story.created_at).toLocaleDateString()}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(story.id)}
                                        className="text-red-400 hover:text-red-300 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
