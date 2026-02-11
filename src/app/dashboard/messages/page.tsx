'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Send, User, Loader2, Grip, Check, CheckCheck } from 'lucide-react' // Grip as generic admin icon
import { motion } from 'framer-motion'
import Link from 'next/link'

type Message = {
    id: string
    content: string
    sender_id: string
    recipient_id: string | null
    created_at: string
    is_read: boolean
}

export default function MemberMessagesPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const supabase = createClient()

    useEffect(() => {
        const initChat = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            setCurrentUser(user)

            // Check Profile Status
            const { data: profile } = await supabase
                .from('profiles')
                .select('status')
                .eq('id', user.id)
                .single()

            if (profile?.status !== 'active') {
                router.push('/dashboard')
                return
            }

            // Fetch history: My messages (sent or received)
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .order('created_at', { ascending: true })

            if (data) setMessages(data)
            setLoading(false)
            scrollToBottom()

            // Subscribe
            const channel = supabase
                .channel(`member-chat-${user.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `recipient_id=eq.${user.id}`, // Admin sent to me
                }, (payload) => {
                    setMessages(prev => {
                        if (prev.find(m => m.id === payload.new.id)) return prev
                        return [...prev, payload.new as Message]
                    })
                    scrollToBottom()
                })
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${user.id}`, // I sent (e.g. from another tab)
                }, (payload) => {
                    setMessages(prev => {
                        if (prev.find(m => m.id === payload.new.id)) return prev
                        return [...prev, payload.new as Message]
                    })
                    scrollToBottom()
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
        initChat()
    }, [])

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUser) return

        setSending(true)
        const msgContent = newMessage.trim()
        setNewMessage('') // Optimistic clear

        try {
            // Send to NULL (Admins pick it up)
            // Or if you want to target specific admin, you need to know their ID.
            // For now, NULL is fine as AdminMessagesPage filters by sender_id only.
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    sender_id: currentUser.id,
                    recipient_id: null,
                    content: msgContent,
                    is_read: false
                })
                .select()
                .single()

            if (error) throw error

            if (data) {
                setMessages(prev => [...prev, data])
                scrollToBottom()
            }
        } catch (error) {
            console.error('Error sending:', error)
            alert('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent-blue)]" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <Link href="/dashboard" className="text-sm text-[var(--color-text-muted)] hover:text-white mb-2 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="font-serif text-2xl md:text-3xl font-semibold">Messages</h1>
                        <p className="text-[var(--color-text-muted)] text-sm">Direct line to Binary Elite Support</p>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex-1 flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xl">

                    {/* Interior Header */}
                    <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3 bg-[var(--color-bg-darker)]">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-accent-blue)]/10 flex items-center justify-center">
                            <Grip className="w-5 h-5 text-[var(--color-accent-blue)]" />
                        </div>
                        <div>
                            <h3 className="font-bold">Support Team</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs text-[var(--color-text-muted)]">Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-bg-dark)]/50">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)] opacity-60">
                                <Grip className="w-12 h-12 mb-2 opacity-50" />
                                <p>No messages yet.</p>
                                <p className="text-sm">Ask us anything about your membership or projects!</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            const isMe = msg.sender_id === currentUser?.id
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id || idx}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`
                                        max-w-[80%] md:max-w-[70%] p-3 md:p-4 rounded-2xl text-sm md:text-base relative
                                        ${isMe
                                            ? 'bg-[var(--color-accent-blue)] text-white rounded-tr-none'
                                            : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-tl-none'
                                        }
                                    `}>
                                        <p>{msg.content}</p>
                                        <div className={`text-[10px] mt-1 flex items-center gap-1 opacity-70 ${isMe ? 'justify-end text-blue-100' : 'text-[var(--color-text-muted)]'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && (
                                                <span>
                                                    {msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-[var(--color-bg-card)] border-t border-[var(--color-border)]">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="p-3 bg-[var(--color-accent-blue)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
