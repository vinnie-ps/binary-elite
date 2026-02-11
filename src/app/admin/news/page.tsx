'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Edit, Trash, Save, X, Image as ImageIcon, Loader2, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Basic Types
type Post = {
    id: string
    title: string
    content: string
    image_url: string | null
    is_published: boolean
    created_at: string
}

export default function AdminNewsPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [currentPost, setCurrentPost] = useState<Partial<Post>>({})

    const supabase = createClient()

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching posts:', error)
        if (data) setPosts(data)
        setLoading(false)
    }

    const handleCreate = () => {
        setCurrentPost({
            title: '',
            content: '',
            image_url: '',
            is_published: false
        })
        setIsEditing(true)
    }

    const handleEdit = (post: Post) => {
        setCurrentPost(post)
        setIsEditing(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Error deleting post')
        } else {
            setPosts(posts.filter(p => p.id !== id))
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            if (currentPost.id) {
                // Update
                const { error } = await supabase
                    .from('posts')
                    .update({
                        title: currentPost.title,
                        content: currentPost.content,
                        image_url: currentPost.image_url,
                        is_published: currentPost.is_published,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentPost.id)

                if (error) throw error
            } else {
                // Create
                const { error } = await supabase
                    .from('posts')
                    .insert({
                        title: currentPost.title!,
                        content: currentPost.content!,
                        image_url: currentPost.image_url,
                        is_published: currentPost.is_published || false,
                    })

                if (error) throw error
            }

            setIsEditing(false)
            fetchPosts()
        } catch (error) {
            console.error('Error saving post:', error)
            alert('Failed to save post')
        } finally {
            setSaving(false)
        }
    }

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold">News & Announcements</h1>
                    <p className="text-[var(--color-text-muted)]">Manage blog posts and updates for members.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-[var(--color-accent-blue)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all font-medium"
                >
                    <Plus className="w-4 h-4" />
                    New Post
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border)]">
                <Search className="w-5 h-5 text-[var(--color-text-muted)]" />
                <input
                    type="text"
                    placeholder="Search posts..."
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
                <div className="grid grid-cols-1 gap-4">
                    {filteredPosts.map(post => (
                        <motion.div
                            layout
                            key={post.id}
                            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:border-[var(--color-accent-blue)] transition-colors group"
                        >
                            {post.image_url && (
                                <img
                                    src={post.image_url}
                                    alt={post.title}
                                    className="w-full md:w-48 h-32 object-cover rounded-lg bg-[var(--color-bg-darker)]"
                                />
                            )}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-xl font-bold group-hover:text-[var(--color-accent-blue)] transition-colors">
                                        {post.title}
                                    </h3>
                                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide flex items-center gap-1
                                        ${post.is_published ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}
                                    `}>
                                        {post.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                        {post.is_published ? 'Published' : 'Draft'}
                                    </div>
                                </div>
                                <p className="text-[var(--color-text-muted)] line-clamp-2 mb-4">
                                    {post.content}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-[var(--color-border)] pt-4 md:pt-0 md:pl-6">
                                <button
                                    onClick={() => handleEdit(post)}
                                    className="p-2 hover:bg-[var(--color-bg-darker)] rounded-lg text-[var(--color-text-secondary)] hover:text-white transition-colors"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-[var(--color-text-secondary)] hover:text-red-400 transition-colors"
                                >
                                    <Trash className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-12 text-[var(--color-text-muted)]">
                            No posts found. Create one to get started.
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
                            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between sticky top-0 bg-[var(--color-bg-card)] z-10">
                                <h2 className="text-xl font-bold">
                                    {currentPost.id ? 'Edit Post' : 'New Post'}
                                </h2>
                                <button onClick={() => setIsEditing(false)} className="text-[var(--color-text-muted)] hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentPost.title}
                                        onChange={e => setCurrentPost({ ...currentPost, title: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                        placeholder="Enter post title"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Post Image</label>
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0]
                                                        if (!file) return

                                                        // Upload logic
                                                        const fileExt = file.name.split('.').pop()
                                                        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
                                                        const filePath = `news/${fileName}`

                                                        const { error: uploadError } = await supabase.storage
                                                            .from('content-assets')
                                                            .upload(filePath, file)

                                                        if (uploadError) {
                                                            console.error('Error uploading image:', uploadError)
                                                            alert('Error uploading image')
                                                            return
                                                        }

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('content-assets')
                                                            .getPublicUrl(filePath)

                                                        setCurrentPost({ ...currentPost, image_url: publicUrl })
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
                                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                                Upload an image from your computer.
                                            </p>
                                        </div>
                                        {currentPost.image_url && (
                                            <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-[var(--color-border)] group">
                                                <img src={currentPost.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentPost({ ...currentPost, image_url: '' })}
                                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Content</label>
                                    <textarea
                                        required
                                        rows={8}
                                        value={currentPost.content}
                                        onChange={e => setCurrentPost({ ...currentPost, content: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)] font-mono text-sm"
                                        placeholder="Write your update here..."
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[var(--color-bg-darker)] rounded-lg border border-[var(--color-border)]">
                                    <div>
                                        <h4 className="font-medium">Publish Status</h4>
                                        <p className="text-xs text-[var(--color-text-muted)]">
                                            {currentPost.is_published ? 'Post will be visible to all members.' : 'Post is currently saved as a draft.'}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={currentPost.is_published}
                                            onChange={e => setCurrentPost({ ...currentPost, is_published: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-blue)]"></div>
                                    </label>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-[var(--color-accent-blue)] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Post
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
