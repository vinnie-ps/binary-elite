'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Edit2, X, Save, Plus, Trash2, Eye, EyeOff, Upload } from 'lucide-react'
import Image from 'next/image'

type Announcement = {
    id: string
    title: string
    content: string
    category: string
    image_url: string | null
    is_published: boolean
    publish_date: string
    author_id: string | null
}

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'update',
        image_url: '',
        is_published: false,
        publish_date: new Date().toISOString().split('T')[0]
    })

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const { data } = await supabase
            .from('public_announcements')
            .select('*')
            .order('publish_date', { ascending: false })

        if (data) setAnnouncements(data)
        setLoading(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `announcements/${fileName}`

        setUploading(true)

        try {
            const { error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('site-assets')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, image_url: publicUrl }))
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Error uploading image')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const { data: { user } } = await supabase.auth.getUser()

        const payload = {
            ...formData,
            author_id: user?.id || null
        }

        try {
            if (editingAnnouncement) {
                const { error } = await supabase
                    .from('public_announcements')
                    .update(payload)
                    .eq('id', editingAnnouncement.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('public_announcements')
                    .insert([payload])
                if (error) throw error
            }

            setIsModalOpen(false)
            setEditingAnnouncement(null)
            resetForm()
            fetchData()
        } catch (error: any) {
            console.error('Error saving announcement:', error)
            alert(error.message || 'Error saving announcement')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this announcement?')) return

        const { error } = await supabase
            .from('public_announcements')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting announcement:', error)
            alert('Error deleting announcement')
        } else {
            fetchData()
        }
    }

    const togglePublished = async (announcement: Announcement) => {
        const { error } = await supabase
            .from('public_announcements')
            .update({ is_published: !announcement.is_published })
            .eq('id', announcement.id)

        if (!error) fetchData()
    }

    const openEditModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement)
        setFormData({
            title: announcement.title,
            content: announcement.content,
            category: announcement.category,
            image_url: announcement.image_url || '',
            is_published: announcement.is_published,
            publish_date: announcement.publish_date.split('T')[0]
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            category: 'update',
            image_url: '',
            is_published: false,
            publish_date: new Date().toISOString().split('T')[0]
        })
    }

    const filteredAnnouncements = announcements.filter(announcement =>
        (announcement.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold mb-2">Public Announcements</h1>
                    <p className="text-[var(--color-text-muted)]">Manage news, events, and updates for the landing page</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAnnouncement(null)
                        resetForm()
                        setIsModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-blue)] text-white rounded-lg hover:opacity-90 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Announcement
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <div className="space-y-4">
                    {filteredAnnouncements.map((announcement) => (
                        <div key={announcement.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-lg">{announcement.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wide
                                            ${announcement.category === 'newsletter' ? 'bg-blue-500/20 text-blue-400' :
                                                announcement.category === 'event' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-purple-500/20 text-purple-400'}
                                        `}>
                                            {announcement.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-2">
                                        {announcement.content}
                                    </p>
                                    <div className="text-xs text-gray-500">
                                        {new Date(announcement.publish_date).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => togglePublished(announcement)}
                                        className={`p-2 rounded-lg transition-colors ${announcement.is_published
                                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                        title={announcement.is_published ? 'Published' : 'Draft'}
                                    >
                                        {announcement.is_published ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => openEditModal(announcement)}
                                        className="p-2 bg-[var(--color-bg-darker)] rounded-lg hover:bg-[var(--color-accent-blue)] hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(announcement.id)}
                                        className="p-2 bg-[var(--color-bg-darker)] rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                            <h2 className="text-xl font-bold font-serif">
                                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X className="w-6 h-6 text-[var(--color-text-muted)] hover:text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Content *</label>
                                <textarea
                                    rows={8}
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                    >
                                        <option value="update">Update</option>
                                        <option value="newsletter">Newsletter</option>
                                        <option value="event">Event</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Publish Date</label>
                                    <input
                                        type="date"
                                        value={formData.publish_date}
                                        onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Image</label>
                                <div className="flex items-center gap-4">
                                    {formData.image_url && (
                                        <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden border border-[var(--color-border)]">
                                            <Image
                                                src={formData.image_url}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <label className="flex items-center justify-center w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] border-dashed rounded-lg cursor-pointer hover:border-[var(--color-accent-blue)] transition-colors">
                                            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                                                <Upload className="w-4 h-4" />
                                                <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                            Recommended: 16:9 aspect ratio, max 2MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_published}
                                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Publish immediately</span>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg hover:bg-[var(--color-bg-darker)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-6 py-2 bg-[var(--color-accent-blue)] text-white rounded-lg hover:opacity-90 transition-all"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Announcement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
