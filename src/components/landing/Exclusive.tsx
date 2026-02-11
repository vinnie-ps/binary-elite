'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

interface ExclusiveProps {
    title: string
    statement: string
}

export default function Exclusive({ title, statement }: ExclusiveProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-50px' })

    return (
        <section id="join" ref={ref} className="relative py-24 px-8 md:px-16 lg:px-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
                animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto"
            >
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-8">
                    {title}
                </h2>

                <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed">
                    {statement}
                </p>

                <Link href="/register">
                    <button className="group relative px-10 py-4 rounded-lg font-medium overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-blue)] to-[#2563eb] opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                            style={{ boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)' }} />
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-blue-light)] to-[var(--color-accent-blue)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ boxShadow: '0 6px 30px rgba(59, 130, 246, 0.4)' }} />
                        <span className="relative z-10 text-white">Apply to Join</span>
                    </button>
                </Link>
            </motion.div>
        </section>
    )
}
