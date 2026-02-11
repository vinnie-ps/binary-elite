'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Edit2, Trash2, X, Upload, Save, Wrench } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminToolsPage() {
    const [tools, setTools] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTool, setEditingTool] = useState<any>(null)
    const [uploading, setUploading] = useState(false)

    // Form Stats
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        link: '',
        image_url: '',
        visibility: 'member'
    })

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchTools()
    }, [])

    const fetchTools = async () => {
        const { data, error } = await supabase
            .from('tools')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching tools:', error)
        else setTools(data || [])
        setLoading(false)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `tools/${fileName}`

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
        setUploading(true) // Re-use uploading state for submission loading

        try {
            if (editingTool) {
                const { error } = await supabase
                    .from('tools')
                    .update(formData)
                    .eq('id', editingTool.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('tools')
                    .insert([formData])
                if (error) throw error
            }

            setIsModalOpen(false)
            setEditingTool(null)
            resetForm()
            fetchTools()
            router.refresh()
        } catch (error) {
            console.error('Error saving tool:', error)
            alert('Error saving tool')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tool?')) return

        const { error } = await supabase
            .from('tools')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting tool:', error)
            alert('Error deleting tool')
        } else {
            fetchTools()
        }
    }

    const openEditModal = (tool: any) => {
        setEditingTool(tool)
        setFormData({
            title: tool.title,
            description: tool.description || '',
            price: tool.price || '',
            link: tool.link || '',
            image_url: tool.image_url || '',
            visibility: tool.visibility || 'member'
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price: '',
            link: '',
            image_url: '',
            visibility: 'member'
        })
    }

    const filteredTools = tools.filter(tool =>
        tool.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold mb-2">Tools & Resources</h1>
                    <p className="text-[var(--color-text-muted)]">Manage tools available to members</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTool(null)
                        resetForm()
                        setIsModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-blue)] text-white rounded-lg hover:opacity-90 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Tool
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input
                    type="text"
                    placeholder="Search tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTools.map(tool => (
                        <div key={tool.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 group flex flex-col">
                            <div className="relative mb-4 aspect-video bg-[var(--color-bg-darker)] rounded-lg overflow-hidden flex items-center justify-center">
                                {tool.image_url ? (
                                    <img src={tool.image_url} alt={tool.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Wrench className="w-10 h-10 text-[var(--color-text-muted)]" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => openEditModal(tool)}
                                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tool.id)}
                                        className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{tool.title}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wide
                                    ${tool.visibility === 'public' ? 'bg-green-500/20 text-green-400' :
                                        tool.visibility === 'member' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-gray-700 text-gray-400'}
                                `}>
                                    {tool.visibility}
                                </span>
                            </div>

                            <p className="text-sm text-[var(--color-text-muted)] mb-4 flex-grow line-clamp-3">
                                {tool.description}
                            </p>

                            <div className="mt-auto pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-sm">
                                <span className="font-mono text-[var(--color-accent-blue)]">{tool.price}</span>
                                {tool.link && (
                                    <a href={tool.link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white truncate max-w-[150px]">
                                        {tool.link}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                            <h2 className="text-xl font-bold font-serif">
                                {editingTool ? 'Edit Tool' : 'Add New Tool'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X className="w-6 h-6 text-[var(--color-text-muted)] hover:text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tool Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price / Cost</label>
                                    <input
                                        type="text"
                                        placeholder="Free, $29/mo, etc."
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">External Link</label>
                                <input
                                    type="url"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image (Optional)</label>
                                    <div className="flex gap-2">
                                        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] border-dashed rounded-lg hover:border-[var(--color-accent-blue)] hover:bg-[rgba(59,130,246,0.1)] transition-colors">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm">Upload</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                        </label>
                                        {formData.image_url && (
                                            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-800">
                                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Visibility</label>
                                    <select
                                        value={formData.visibility}
                                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                    >
                                        <option value="public">Public</option>
                                        <option value="member">Members Only</option>
                                        <option value="hidden">Hidden</option>
                                    </select>
                                </div>
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
                                    disabled={uploading}
                                    className="flex items-center gap-2 px-6 py-2 bg-[var(--color-accent-blue)] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {uploading ? 'Saving...' : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Tool
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
