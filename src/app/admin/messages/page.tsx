'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Send, User, Loader2, Check, CheckCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Profile = {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
}

type Message = {
    id: string
    content: string
    sender_id: string
    recipient_id: string | null
    created_at: string
    is_read: boolean
}

export default function AdminMessagesPage() {
    const [loading, setLoading] = useState(true)
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const supabase = createClient()

    // 1. Fetch Admin User & All Profiles
    useEffect(() => {
        const initData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)

            // Fetch all profiles (members) to populate the sidebar
            // In a real large app, you'd paginate or filter this
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name, email, avatar_url')
                .neq('role', 'admin') // Filter out other admins if desired, or keep them
                .order('full_name', { ascending: true })

            if (profilesData) {
                setProfiles(profilesData)
                setFilteredProfiles(profilesData)
            }
            setLoading(false)
        }
        initData()
    }, [])

    // 2. Search Filter
    useEffect(() => {
        if (!searchQuery) {
            setFilteredProfiles(profiles)
        } else {
            const lowerQ = searchQuery.toLowerCase()
            setFilteredProfiles(profiles.filter(p =>
                (p.full_name?.toLowerCase() || '').includes(lowerQ) ||
                (p.email?.toLowerCase() || '').includes(lowerQ)
            ))
        }
    }, [searchQuery, profiles])

    // 3. Fetch Messages for Selected User & Subscribe
    useEffect(() => {
        if (!selectedUserId || !currentUser) return

        // Fetch initial history
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${selectedUserId},recipient_id.eq.${selectedUserId}`)
                .order('created_at', { ascending: true })

            if (data) setMessages(data)
            scrollToBottom()
        }
        fetchMessages()

        // Subscribe to realtime updates for this specific conversation
        const channel = supabase
            .channel(`admin-chat-${selectedUserId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${selectedUserId}`, // Incoming from member
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message])
                scrollToBottom()
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${selectedUserId}`, // Outgoing from admin (if multiple admins)
            }, (payload) => {
                // Determine if we should add it (avoid duplicates if we optimistic update)
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
    }, [selectedUserId, currentUser])

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedUserId || !currentUser) return

        setSending(true)
        const msgContent = newMessage.trim()
        setNewMessage('') // Optimistic clear

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    sender_id: currentUser.id,
                    recipient_id: selectedUserId,
                    content: msgContent,
                    is_read: false
                })
                .select()
                .single()

            if (error) throw error

            // Add to local state immediately
            if (data) {
                setMessages(prev => [...prev, data])
                scrollToBottom()
            }
        } catch (error) {
            console.error('Error sending message:', error)
            alert('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent-blue)]" />
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6">
            {/* Sidebar - User List */}
            <div className="w-80 flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-[var(--color-border)]">
                    <h2 className="font-bold mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent-blue)]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredProfiles.map(profile => (
                        <button
                            key={profile.id}
                            onClick={() => setSelectedUserId(profile.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedUserId === profile.id
                                    ? 'bg-[var(--color-accent-blue)] text-white shadow-lg shadow-blue-500/20'
                                    : 'hover:bg-[var(--color-bg-darker)] text-[var(--color-text-secondary)]'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedUserId === profile.id ? 'bg-white/20' : 'bg-[var(--color-bg-dark)]'}`}>
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 opacity-70" />
                                )}
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="font-medium truncate">{profile.full_name || 'Unnamed User'}</p>
                                <p className={`text-xs truncate ${selectedUserId === profile.id ? 'text-blue-100' : 'text-[var(--color-text-muted)]'}`}>
                                    {profile.email}
                                </p>
                            </div>
                        </button>
                    ))}

                    {filteredProfiles.length === 0 && (
                        <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
                            No members found.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                {!selectedUserId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                        <div className="w-16 h-16 bg-[var(--color-bg-darker)] rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8 opacity-50" />
                        </div>
                        <p>Select a member to start chatting</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3 bg-[var(--color-bg-card)]">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-bg-darker)] flex items-center justify-center overflow-hidden">
                                {Number(profiles.find(p => p.id === selectedUserId)?.avatar_url) ? (
                                    <img src={profiles.find(p => p.id === selectedUserId)?.avatar_url!} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-[var(--color-text-muted)]" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold">{profiles.find(p => p.id === selectedUserId)?.full_name}</h3>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    {profiles.find(p => p.id === selectedUserId)?.email}
                                </p>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-bg-darker)]/30">
                            {messages.length === 0 && (
                                <div className="text-center py-10 text-[var(--color-text-muted)] text-sm">
                                    No messages yet. Start the conversation!
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
                                            max-w-[70%] p-3 rounded-2xl text-sm relative group
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
                                    placeholder="Type a message..."
                                    className="flex-1 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent-blue)]"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !newMessage.trim()}
                                    className="p-3 bg-[var(--color-accent-blue)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
