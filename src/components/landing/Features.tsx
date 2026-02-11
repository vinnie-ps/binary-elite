'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import type { Database } from '@/lib/supabase/types'

type FeatureCard = Database['public']['Tables']['feature_cards']['Row']

interface FeaturesProps {
    features: FeatureCard[]
}

export default function Features({ features }: FeaturesProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-50px' })

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: 'easeOut'
            }
        }
    }

    return (
        <section ref={ref} className="relative py-24 px-8 md:px-16 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
                    animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-4">
                        What is Binary Elite?
                    </h2>
                    <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] font-light mb-4">
                        Tech-Driven, Education-Focused, Forward-Thinking
                    </p>
                    <p className="max-w-3xl mx-auto text-[var(--color-text-muted)] leading-relaxed">
                        Binary Elite (BE) is a group of like-minded individuals united by technology, innovation, and education. We build tools, platforms, and ideas that empower the next generation of learners and creators.
                    </p>
                </motion.div>

                {/* Feature Cards Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.id}
                            variants={cardVariants}
                            whileHover={{
                                y: -5,
                                scale: 1.02,
                                transition: { duration: 0.3 }
                            }}
                            className="group relative bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 md:p-12 text-center backdrop-blur-[10px] overflow-hidden transition-all duration-300 hover:border-[var(--color-accent-blue)] hover:shadow-[0_10px_40px_rgba(59,130,246,0.2),inset_0_0_40px_rgba(59,130,246,0.05)]"
                        >
                            {/* Gradient Background on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(59,130,246,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Icon */}
                            <div className="relative w-20 h-20 mx-auto mb-8 flex items-center justify-center">
                                {feature.icon.startsWith('http') ? (
                                    <img
                                        src={feature.icon}
                                        alt={feature.title}
                                        className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                    />
                                ) : (
                                    <div className="text-5xl" style={{ filter: 'drop-shadow(0 0 20px var(--color-accent-blue-glow))' }}>
                                        {feature.icon}
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="relative font-serif text-2xl md:text-3xl font-semibold mb-4">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="relative text-[var(--color-text-muted)] leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
