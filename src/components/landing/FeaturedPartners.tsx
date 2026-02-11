'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ExternalLink, User } from 'lucide-react'

type FeaturedMember = {
    id: string
    full_name: string
    joining_reason: string
    experience_level: string
    website_link: string
    profile_photo_url: string
    portfolio_images: string[]
}

export default function FeaturedPartners() {
    const [partners, setPartners] = useState<FeaturedMember[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFeatured = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_featured', true)
                .eq('status', 'active')
                .limit(6)

            if (data) setPartners(data)
            setLoading(false)
        }
        fetchFeatured()
    }, [])

    if (!loading && partners.length === 0) return null

    return (
        <section className="py-24 px-8 md:px-16 lg:px-8 bg-[var(--color-bg-dark)]/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-serif text-3xl md:text-5xl font-semibold mb-6"
                    >
                        Featured Builders
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto"
                    >
                        Meet the elite minds shaping the future with us.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {partners.map((partner, index) => (
                        <motion.div
                            key={partner.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:border-[var(--color-accent-blue)] transition-all duration-300"
                        >
                            {/* Portfolio Preview */}
                            <div className="h-48 bg-[var(--color-bg-darker)] relative overflow-hidden">
                                {partner.portfolio_images && partner.portfolio_images.length > 0 ? (
                                    <div className="flex h-full animate-scroll-x hover:pause">
                                        <img
                                            src={partner.portfolio_images[0]}
                                            alt="Portfolio"
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800/50">
                                        <span className="text-[var(--color-text-muted)]">No Portfolio Images</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] to-transparent opacity-90" />

                                {/* Profile Photo overlay */}
                                <div className="absolute bottom-4 left-6 flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full border-2 border-[var(--color-accent-blue)] overflow-hidden bg-[var(--color-bg-card)]">
                                        {partner.profile_photo_url ? (
                                            <img src={partner.profile_photo_url} alt={partner.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-darker)]">
                                                <User className="w-8 h-8 text-[var(--color-text-muted)]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 pt-2">
                                <h3 className="text-xl font-bold mb-1">{partner.full_name}</h3>
                                <p className="text-sm text-[var(--color-accent-blue)] mb-4">{partner.experience_level}</p>

                                {partner.website_link && (
                                    <a
                                        href={partner.website_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors group/link"
                                    >
                                        Visit Portfolio
                                        <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
