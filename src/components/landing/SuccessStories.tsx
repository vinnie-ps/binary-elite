'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Quote, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

type Testimonial = {
    id: string
    content: string
    role: string | null
    rating: number
    profiles: {
        full_name: string | null
        profile_photo_url: string | null
    }
}

export default function SuccessStories() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        const fetchStories = async () => {
            const { data } = await supabase
                .from('testimonials')
                .select(`
                    id,
                    content,
                    role,
                    rating,
                    profiles (
                        full_name,
                        profile_photo_url
                    )
                `)
                .eq('is_featured', true)
                .order('created_at', { ascending: false })
                .limit(6)

            if (data) setTestimonials(data as any)
            setLoading(false)
        }

        fetchStories()
    }, [])

    if (loading) return null
    if (testimonials.length === 0) return null

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-bg-dark)] -z-20" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-accent-blue)]/5 rounded-full blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4"
                    >
                        <Quote className="w-4 h-4" />
                        <span>Community Voices</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="font-serif text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-6"
                    >
                        Success Stories
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto"
                    >
                        Hear directly from our members about how Binary Elite has impacted their careers and growth.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((story, index) => (
                        <motion.div
                            key={story.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-[var(--color-bg-card)]/50 backdrop-blur-sm border border-[var(--color-border)] p-8 rounded-2xl hover:border-[var(--color-accent-blue)]/50 transition-all group"
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(story.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>

                            <p className="text-[var(--color-text-secondary)] mb-8 text-lg leading-relaxed italic">
                                "{story.content}"
                            </p>

                            <div className="flex items-center gap-4 border-t border-[var(--color-border)]/50 pt-6">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-bg-darker)] overflow-hidden border border-[var(--color-border)]">
                                    {story.profiles.profile_photo_url ? (
                                        <Image src={story.profiles.profile_photo_url} alt="Profile" width={48} height={48} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[var(--color-text-primary)]">{story.profiles.full_name || 'Member'}</h4>
                                    <p className="text-sm text-[var(--color-text-muted)]">{story.role || 'Community Member'}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
