'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface StatCardProps {
    title: string
    value: string | number
    icon: ReactNode
    color: 'blue' | 'purple' | 'green' | 'pink' | 'orange'
    trend?: {
        value: number
        label: string
    }
}

export function StatCard({ title, value, icon, color, trend }: StatCardProps) {
    const colorClasses = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        green: 'text-green-400 bg-green-500/10 border-green-500/20',
        pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl bg-[var(--color-bg-card)]/50 ${colorClasses[color].split(' ')[2]} border-opacity-50 hover:border-opacity-100 transition-colors group`}
        >
            {/* Neon Glow Effect */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 bg-${color}-500/30 group-hover:opacity-40 transition-opacity`} />

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-1">{title}</h3>
                    <div className="text-3xl font-bold font-serif tracking-tight">{value}</div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs mt-2 ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            <span>{trend.value >= 0 ? '+' : ''}{trend.value}%</span>
                            <span className="text-[var(--color-text-muted)]">{trend.label}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color].split(' ')[1]} ${colorClasses[color].split(' ')[0]}`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    )
}
