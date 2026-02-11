'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import type { Database } from '@/lib/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectsProps {
    projects: Project[]
}

export default function Projects({ projects }: ProjectsProps) {
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

    const getBadgeLabel = (status: string) => {
        const labels: Record<string, string> = {
            live: 'Live',
            mvp: 'MVP',
            in_progress: 'In Progress'
        }
        return labels[status] || status
    }

    return (
        <section id="projects" ref={ref} className="relative py-24 px-8 md:px-16 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
                    animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-4">
                        Featured Projects
                    </h2>
                    <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] font-light">
                        Innovating at the Intersection of Tech & Education
                    </p>
                </motion.div>

                {/* Projects Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            variants={cardVariants}
                            whileHover={{
                                y: -8,
                                scale: 1.02,
                                transition: { duration: 0.3 }
                            }}
                            className="group relative bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 backdrop-blur-[10px] overflow-hidden transition-all duration-300 hover:border-[var(--color-accent-blue)] hover:shadow-[0_15px_50px_rgba(59,130,246,0.25),inset_0_0_40px_rgba(59,130,246,0.05)]"
                        >
                            {/* Project Header */}
                            <div className="relative flex items-center gap-4 mb-6">
                                {/* Icon */}
                                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                    {project.icon.startsWith('http') ? (
                                        <img
                                            src={project.icon}
                                            alt={project.title}
                                            className="w-full h-full object-contain rounded drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        />
                                    ) : (
                                        <div className="text-3xl" style={{ filter: 'drop-shadow(0 0 15px var(--color-accent-blue-glow))' }}>
                                            {project.icon}
                                        </div>
                                    )}
                                </div>

                                {/* Title & Badge */}
                                <div className="flex-1">
                                    <h3 className="font-serif text-xl md:text-2xl font-semibold mb-1">
                                        {project.title}
                                    </h3>
                                    <span className="inline-block px-3 py-1 bg-[rgba(59,130,246,0.2)] border border-[var(--color-accent-blue)] rounded text-xs font-medium text-[var(--color-accent-blue)] uppercase tracking-wider">
                                        {getBadgeLabel(project.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="relative text-[var(--color-text-muted)] mb-4">
                                {project.description}
                            </p>

                            {/* Features List */}
                            <ul className="relative space-y-2">
                                {project.features.map((feature, idx) => (
                                    <li
                                        key={idx}
                                        className="text-[var(--color-text-muted)] pl-6 relative before:content-['▹'] before:absolute before:left-0 before:text-[var(--color-accent-blue)] before:font-bold"
                                    >
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
