'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Newspaper, Calendar, Megaphone, ArrowRight } from 'lucide-react'
import Image from 'next/image'

type Announcement = {
    id: string
    title: string
    content: string
    category: string
    image_url: string | null
    publish_date: string
    author_id: string | null
}

const categoryIcons = {
    newsletter: Newspaper,
    event: Calendar,
    update: Megaphone
}

const categoryColors = {
    newsletter: 'blue',
    event: 'green',
    update: 'purple'
}

export default function PublicNews() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    const fetchAnnouncements = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('public_announcements')
            .select('*')
            .eq('is_published', true)
            .lte('publish_date', new Date().toISOString())
            .order('publish_date', { ascending: false })
            .limit(6)

        if (data) setAnnouncements(data)
        setLoading(false)
    }

    if (loading) return null
    if (announcements.length === 0) return null

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-dark)]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                        <Newspaper className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">Latest Updates</span>
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                        Community <span className="text-gradient">News & Events</span>
                    </h2>
                    <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                        Stay informed about upcoming activities, newsletters, and important announcements
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {announcements.map((announcement) => {
                        const Icon = categoryIcons[announcement.category as keyof typeof categoryIcons] || Megaphone
                        const color = categoryColors[announcement.category as keyof typeof categoryColors] || 'blue'

                        return (
                            <div
                                key={announcement.id}
                                onClick={() => setSelectedAnnouncement(announcement)}
                                className="group bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:border-[var(--color-accent-blue)] transition-all cursor-pointer"
                            >
                                {/* Image */}
                                {announcement.image_url && (
                                    <div className="relative h-48 bg-[var(--color-bg-darker)] overflow-hidden">
                                        <Image
                                            src={announcement.image_url}
                                            alt={announcement.title || 'Announcement'}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Category Badge */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`p-1.5 bg-${color}-500/10 rounded-lg`}>
                                            <Icon className={`w-4 h-4 text-${color}-400`} />
                                        </div>
                                        <span className={`text-xs font-medium text-${color}-400 uppercase tracking-wide`}>
                                            {announcement.category}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-auto">
                                            {new Date(announcement.publish_date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-[var(--color-accent-blue)] transition-colors">
                                        {announcement.title || 'Breaking Update'}
                                    </h3>

                                    {/* Content Preview */}
                                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-3 mb-4">
                                        {announcement.content}
                                    </p>

                                    {/* Read More */}
                                    <button className="flex items-center gap-2 text-sm text-[var(--color-accent-blue)] group-hover:gap-3 transition-all">
                                        Read More
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Modal */}
            {selectedAnnouncement && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedAnnouncement(null)}
                >
                    <div
                        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image */}
                        {selectedAnnouncement.image_url && (
                            <div className="relative h-64 bg-[var(--color-bg-darker)]">
                                <Image
                                    src={selectedAnnouncement.image_url}
                                    alt={selectedAnnouncement.title || 'Announcement'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="p-8">
                            {/* Category & Date */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 bg-${categoryColors[selectedAnnouncement.category as keyof typeof categoryColors] || 'blue'}-500/10 text-${categoryColors[selectedAnnouncement.category as keyof typeof categoryColors] || 'blue'}-400 text-xs font-medium uppercase tracking-wide rounded-full`}>
                                    {selectedAnnouncement.category}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {new Date(selectedAnnouncement.publish_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-3xl font-bold mb-6">{selectedAnnouncement.title || 'Breaking Update'}</h2>

                            {/* Content */}
                            <div className="prose prose-invert max-w-none mb-6">
                                <p className="text-[var(--color-text-muted)] whitespace-pre-wrap">
                                    {selectedAnnouncement.content}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedAnnouncement(null)}
                                className="w-full px-4 py-3 bg-[var(--color-bg-darker)] rounded-lg hover:bg-[var(--color-accent-blue)] transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
