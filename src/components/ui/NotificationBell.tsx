'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Mail, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
    id: string
    content: string
    sender_id: string
    created_at: string
    is_read: boolean
    sender?: {
        full_name: string | null
        email: string | null
    }
}

export function NotificationBell() {
    const [mounted, setMounted] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [unreadMessages, setUnreadMessages] = useState<Message[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [messagesLink, setMessagesLink] = useState('/dashboard/messages')
    const dropdownRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // Fetch current user and unread messages
    useEffect(() => {
        if (!mounted) return

        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                setCurrentUser(user)

                // Check user role to determine messages link
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile?.role === 'admin') {
                    setMessagesLink('/admin/messages')
                }

                // Fetch unread messages where current user is the recipient
                const { data: messages, error } = await supabase
                    .from('messages')
                    .select(`
                        *,
                        sender:profiles!messages_sender_id_fkey(full_name, email)
                    `)
                    .eq('recipient_id', user.id)
                    .eq('is_read', false)
                    .order('created_at', { ascending: false })
                    .limit(5)

                if (error) {
                    // If table doesn't exist, just log and continue
                    console.log('Messages table not yet created or error fetching:', error.message)
                    return
                }

                if (messages) {
                    setUnreadMessages(messages)
                    setUnreadCount(messages.length)
                }
            } catch (error) {
                console.log('Error in NotificationBell fetchData:', error)
                // Don't crash the component, just log the error
            }
        }
        fetchData()

        // Subscribe to new messages (only if table exists)
        try {
            const channel = supabase
                .channel('notification-bell')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                }, () => {
                    fetchData() // Refresh on new message
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                }, () => {
                    fetchData() // Refresh when message is marked as read
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        } catch (error) {
            console.log('Error subscribing to messages:', error)
            return () => { } // Return empty cleanup function
        }
    }, [mounted])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const markAsRead = async (messageId: string) => {
        try {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', messageId)

            // Remove from local state
            setUnreadMessages(prev => prev.filter(m => m.id !== messageId))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking message as read:', error)
        }
    }

    // Render placeholder during SSR/initial mount
    if (!mounted) {
        return (
            <div className="relative">
                <button className="relative p-2 text-[var(--color-text-secondary)] hover:text-white transition-colors rounded-lg hover:bg-[var(--color-bg-darker)]">
                    <Bell className="w-5 h-5" />
                </button>
            </div>
        )
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-[var(--color-text-secondary)] hover:text-white transition-colors rounded-lg hover:bg-[var(--color-bg-darker)]"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                            <h3 className="font-bold text-sm">Notifications</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[var(--color-text-muted)] hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages List */}
                        <div className="max-h-96 overflow-y-auto">
                            {unreadMessages.length === 0 ? (
                                <div className="p-8 text-center text-[var(--color-text-muted)] text-sm">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No new notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--color-border)]">
                                    {unreadMessages.map(message => (
                                        <div
                                            key={message.id}
                                            className="p-4 hover:bg-[var(--color-bg-darker)] transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                                    <Mail className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-white mb-1">
                                                        {message.sender?.full_name || message.sender?.email || 'Someone'}
                                                    </p>
                                                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                                                        {message.content}
                                                    </p>
                                                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                                                        {new Date(message.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => markAsRead(message.id)}
                                                    className="text-[var(--color-text-muted)] hover:text-white text-xs"
                                                    title="Mark as read"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-darker)]">
                            <Link
                                href={messagesLink}
                                onClick={() => setIsOpen(false)}
                                className="block text-center text-sm text-[var(--color-accent-blue)] hover:underline"
                            >
                                View all messages →
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
