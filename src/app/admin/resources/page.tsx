'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Edit, Trash, Save, X, Link, FileText, Video as VideoIcon, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Basic Types
type Resource = {
    id: string
    title: string
    description: string
    url: string
    type: 'pdf' | 'video' | 'link'
    category: string
    is_active: boolean
    created_at: string
}

export default function AdminResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [currentResource, setCurrentResource] = useState<Partial<Resource>>({})

    const supabase = createClient()

    useEffect(() => {
        fetchResources()
    }, [])

    const fetchResources = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching resources:', error)
        if (data) setResources(data)
        setLoading(false)
    }

    const handleCreate = () => {
        setCurrentResource({
            title: '',
            description: '',
            url: '',
            type: 'link',
            category: 'general',
            is_active: true
        })
        setIsEditing(true)
    }

    const handleEdit = (res: Resource) => {
        setCurrentResource(res)
        setIsEditing(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return

        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Error deleting resource')
        } else {
            setResources(resources.filter(r => r.id !== id))
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            if (currentResource.id) {
                // Update
                const { error } = await supabase
                    .from('resources')
                    .update({
                        title: currentResource.title,
                        description: currentResource.description,
                        url: currentResource.url,
                        type: currentResource.type,
                        category: currentResource.category,
                        is_active: currentResource.is_active,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentResource.id)

                if (error) throw error
            } else {
                // Create
                const { error } = await supabase
                    .from('resources')
                    .insert({
                        title: currentResource.title!,
                        description: currentResource.description!,
                        url: currentResource.url!,
                        type: currentResource.type || 'link',
                        category: currentResource.category || 'general',
                        is_active: currentResource.is_active || true,
                    })

                if (error) throw error
            }

            setIsEditing(false)
            fetchResources()
        } catch (error) {
            console.error('Error saving resource:', error)
            alert('Failed to save resource')
        } finally {
            setSaving(false)
        }
    }

    const filteredResources = resources.filter(res =>
        res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="w-4 h-4" />
            case 'video': return <VideoIcon className="w-4 h-4" />
            default: return <Link className="w-4 h-4" />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Resource Library</h1>
                    <p className="text-[var(--color-text-muted)]">Manage educational content and downloads.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-[var(--color-accent-blue)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Resource
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border)]">
                <Search className="w-5 h-5 text-[var(--color-text-muted)]" />
                <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-[var(--color-text-primary)] w-full"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent-blue)]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map(res => (
                        <motion.div
                            layout
                            key={res.id}
                            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-accent-blue)] transition-all group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg flex items-center justify-center
                                        ${res.type === 'pdf' ? 'bg-red-500/10 text-red-400'
                                            : res.type === 'video' ? 'bg-purple-500/10 text-purple-400'
                                                : 'bg-blue-500/10 text-blue-400'
                                        }
                                    `}>
                                        {getTypeIcon(res.type)}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(res)}
                                            className="p-2 hover:bg-[var(--color-bg-darker)] rounded-lg text-[var(--color-text-secondary)] hover:text-white transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(res.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-[var(--color-text-secondary)] hover:text-red-400 transition-colors"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg mb-1 line-clamp-1" title={res.title}>{res.title}</h3>
                                <p className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-2" title={res.description}>{res.description}</p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                                <span className="bg-[var(--color-bg-darker)] px-2 py-1 rounded uppercase font-bold tracking-wider text-[10px]">
                                    {res.category}
                                </span>
                                <span className={res.is_active ? 'text-green-400' : 'text-gray-500'}>
                                    {res.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {filteredResources.length === 0 && (
                        <div className="col-span-full text-center py-12 text-[var(--color-text-muted)]">
                            No resources found. Add one to build the library.
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal / Form Overlay */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between sticky top-0 bg-[var(--color-bg-card)] z-10">
                                <h2 className="text-xl font-bold">
                                    {currentResource.id ? 'Edit Resource' : 'Add Resource'}
                                </h2>
                                <button onClick={() => setIsEditing(false)} className="text-[var(--color-text-muted)] hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentResource.title}
                                        onChange={e => setCurrentResource({ ...currentResource, title: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                        placeholder="Resource Title"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Type</label>
                                        <select
                                            value={currentResource.type}
                                            onChange={e => setCurrentResource({ ...currentResource, type: e.target.value as any })}
                                            className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)] text-white"
                                        >
                                            <option value="link">Link</option>
                                            <option value="pdf">PDF / Document</option>
                                            <option value="video">Video</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category</label>
                                        <input
                                            type="text"
                                            value={currentResource.category}
                                            onChange={e => setCurrentResource({ ...currentResource, category: e.target.value })}
                                            className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                            placeholder="e.g. Guides"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {currentResource.type === 'link' ? 'External URL' : 'Upload File'}
                                    </label>

                                    {currentResource.type === 'link' ? (
                                        <div className="relative">
                                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                                            <input
                                                type="url"
                                                required
                                                value={currentResource.url}
                                                onChange={e => setCurrentResource({ ...currentResource, url: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex gap-4 items-center">
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    accept={currentResource.type === 'pdf' ? '.pdf' : 'video/*'}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (!file) return

                                                        const fileExt = file.name.split('.').pop()
                                                        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
                                                        const filePath = `resources/${fileName}`

                                                        const { error: uploadError } = await supabase.storage
                                                            .from('content-assets')
                                                            .upload(filePath, file)

                                                        if (uploadError) {
                                                            console.error('Error uploading file:', uploadError)
                                                            alert('Error uploading file')
                                                            return
                                                        }

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('content-assets')
                                                            .getPublicUrl(filePath)

                                                        setCurrentResource({ ...currentResource, url: publicUrl })
                                                    }}
                                                    className="w-full text-sm text-[var(--color-text-muted)]
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-[var(--color-accent-blue)] file:text-white
                                                        hover:file:bg-blue-600
                                                        cursor-pointer"
                                                />
                                            </div>
                                            {currentResource.url && (
                                                <div className="text-xs text-green-400 font-medium px-2 py-1 bg-green-500/10 rounded">
                                                    File Uploaded
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-xs text-[var(--color-text-muted)]">
                                        {currentResource.type === 'link'
                                            ? 'Paste the external link here.'
                                            : `Select a ${currentResource.type === 'pdf' ? 'PDF document' : 'video file'} to upload.`}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        rows={3}
                                        value={currentResource.description}
                                        onChange={e => setCurrentResource({ ...currentResource, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)] text-sm"
                                        placeholder="Brief description..."
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-darker)] rounded-lg border border-[var(--color-border)]">
                                    <input
                                        type="checkbox"
                                        checked={currentResource.is_active}
                                        onChange={e => setCurrentResource({ ...currentResource, is_active: e.target.checked })}
                                        className="w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-accent-blue)] focus:ring-[var(--color-accent-blue)]"
                                    />
                                    <label className="text-sm">Active (Visible to Members)</label>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-[var(--color-accent-blue)] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Resource
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
