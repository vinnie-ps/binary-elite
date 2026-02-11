'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface HeroProps {
    title: string
    tagline: string
    description: string
    videoUrl?: string
    secondaryLogoUrl?: string
}

export default function Hero({ title, tagline, description, videoUrl, secondaryLogoUrl }: HeroProps) {
    const scrollToProjects = () => {
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 md:px-16 lg:px-8 overflow-hidden">
            {/* Background Video */}
            {videoUrl && (
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover opacity-30"
                    >
                        <source src={videoUrl} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-dark)] via-transparent to-[var(--color-bg-dark)]" />
                </div>
            )}

            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                {/* Top Left Branding */}
                <div className="flex items-center gap-3">
                    {secondaryLogoUrl ? (
                        <img
                            src={secondaryLogoUrl}
                            alt="BE Logo"
                            className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-lg border border-[var(--color-accent-blue)] flex items-center justify-center bg-[rgba(15,15,25,0.5)] backdrop-blur-md">
                            <span className="font-serif text-xl font-bold text-[var(--color-accent-blue)]">BE</span>
                        </div>
                    )}
                </div>

                {/* Top Right Login */}
                <a
                    href="/login"
                    className="px-6 py-2 rounded-full border border-[var(--color-border)] bg-[rgba(15,15,25,0.5)] backdrop-blur-md hover:border-[var(--color-accent-blue)] hover:bg-[rgba(59,130,246,0.1)] transition-all flex items-center gap-2 group"
                >
                    <span className="text-sm font-medium">Member Login</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </a>
            </div>

            <div className="max-w-4xl mx-auto relative z-10 pt-20">
                {/* Central Logo Removed to prioritize video background */}

                {/* Hero Text */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 tracking-tight"
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl lg:text-2xl text-[var(--color-text-secondary)] mb-8 font-light"
                >
                    {tagline}
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="max-w-2xl mx-auto text-[var(--color-text-muted)] mb-12 leading-relaxed"
                >
                    {description}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link href="/register" className="w-full sm:w-auto">
                        <button className="group relative px-10 py-4 rounded-lg font-medium overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 w-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-blue)] to-[#2563eb] opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                                style={{ boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)' }} />
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-blue-light)] to-[var(--color-accent-blue)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ boxShadow: '0 6px 30px rgba(59, 130, 246, 0.4)' }} />
                            <span className="relative z-10 text-white">Join the Collective</span>
                        </button>
                    </Link>

                    <button
                        onClick={scrollToProjects}
                        className="group px-10 py-4 rounded-lg font-medium border-2 border-[var(--color-accent-blue)] text-[var(--color-accent-blue)] bg-transparent hover:bg-[rgba(59,130,246,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] w-full sm:w-auto"
                    >
                        Explore Projects
                    </button>
                </motion.div>
            </div>
        </section>
    )
}
