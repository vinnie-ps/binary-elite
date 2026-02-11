'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, Mail } from 'lucide-react'
import { useEffect } from 'react'

export type Notification = {
    id: string
    title: string
    message: string
    link?: string
}

interface NotificationToastProps {
    notification: Notification
    onClose: (id: string) => void
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(notification.id)
        }, 5000) // Auto-dismiss after 5 seconds
        return () => clearTimeout(timer)
    }, [notification.id, onClose])

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl p-4 flex gap-4 w-80 md:w-96 backdrop-blur-md pointer-events-auto"
            role="alert"
        >
            <div className="bg-blue-500/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-sm text-white">{notification.title}</h4>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{notification.message}</p>
            </div>
            <button
                onClick={() => onClose(notification.id)}
                className="text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    )
}
