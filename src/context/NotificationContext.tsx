'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NotificationToast, Notification } from '@/components/ui/NotificationToast'
import { AnimatePresence } from 'framer-motion'

interface NotificationContextType {
    notifications: Notification[]
    addNotification: (notification: Omit<Notification, 'id'>) => void
    removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const supabase = createClient()

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)
        }
        getUser()
    }, [])

    // Subscribe to new messages
    useEffect(() => {
        if (!currentUser) return

        const channel = supabase
            .channel('global-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${currentUser.id}`,
            }, async (payload) => {
                // Fetch sender details
                const { data: senderProfile } = await supabase
                    .from('profiles')
                    .select('full_name, email')
                    .eq('id', payload.new.sender_id)
                    .single()

                const senderName = senderProfile?.full_name || senderProfile?.email || 'Someone'

                addNotification({
                    title: `New message from ${senderName}`,
                    message: payload.new.content.substring(0, 50) + (payload.new.content.length > 50 ? '...' : ''),
                    link: '/dashboard/messages' // or /admin/messages depending on role
                })
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [currentUser])

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const id = Math.random().toString(36).substring(7)
        setNotifications(prev => [...prev, { ...notification, id }])
    }

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {notifications.map(notification => (
                        <NotificationToast
                            key={notification.id}
                            notification={notification}
                            onClose={removeNotification}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}
