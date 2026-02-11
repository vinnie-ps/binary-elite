'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Edit2, Trash2, X, Upload, Save, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminClassesPage() {
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingClass, setEditingClass] = useState<any>(null)
    const [uploading, setUploading] = useState(false)

    // Form Stats
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        instructor: '',
        status: 'open',
        link: '',
        image_url: '',
        visibility: 'member'
    })

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchClasses()
    }, [])

    const fetchClasses = async () => {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching classes:', error)
        else setClasses(data || [])
        setLoading(false)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `classes/${fileName}`

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
        setUploading(true)

        try {
            if (editingClass) {
                const { error } = await supabase
                    .from('classes')
                    .update(formData)
                    .eq('id', editingClass.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('classes')
                    .insert([formData])
                if (error) throw error
            }

            setIsModalOpen(false)
            setEditingClass(null)
            resetForm()
            fetchClasses()
            router.refresh()
        } catch (error) {
            console.error('Error saving class:', error)
            alert('Error saving class')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this class?')) return

        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting class:', error)
            alert('Error deleting class')
        } else {
            fetchClasses()
        }
    }

    const openEditModal = (cls: any) => {
        setEditingClass(cls)
        setFormData({
            title: cls.title,
            description: cls.description || '',
            instructor: cls.instructor || '',
            status: cls.status || 'open',
            link: cls.link || '',
            image_url: cls.image_url || '',
            visibility: cls.visibility || 'member'
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            instructor: '',
            status: 'open',
            link: '',
            image_url: '',
            visibility: 'member'
        })
    }

    const filteredClasses = classes.filter(cls =>
        cls.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold mb-2">Classes & Workshops</h1>
                    <p className="text-[var(--color-text-muted)]">Manage educational content</p>
                </div>
                <button
                    onClick={() => {
                        setEditingClass(null)
                        resetForm()
                        setIsModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-blue)] text-white rounded-lg hover:opacity-90 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Class
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input
                    type="text"
                    placeholder="Search classes..."
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
                    {filteredClasses.map(cls => (
                        <div key={cls.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 group hover:border-[var(--color-accent-blue)] transition-colors">
                            <div className="w-16 h-16 rounded-lg bg-[var(--color-bg-darker)] flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {cls.image_url ? (
                                    <img src={cls.image_url} alt={cls.title} className="w-full h-full object-cover" />
                                ) : (
                                    <BookOpen className="w-8 h-8 text-[var(--color-text-muted)]" />
                                )}
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h3 className="font-bold text-lg mb-1">{cls.title}</h3>
                                <p className="text-sm text-[var(--color-text-muted)] line-clamp-1">{cls.description}</p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-xs text-gray-400">
                                    <span>Instructor: {cls.instructor || 'TBA'}</span>
                                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                    <span className={cls.status === 'open' ? 'text-green-400' : 'text-yellow-400'}>
                                        {cls.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wide mr-4
                                    ${cls.visibility === 'public' ? 'bg-green-500/20 text-green-400' :
                                        cls.visibility === 'member' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-gray-700 text-gray-400'}
                                `}>
                                    {cls.visibility}
                                </span>
                                <button
                                    onClick={() => openEditModal(cls)}
                                    className="p-2 bg-[var(--color-bg-darker)] rounded-lg hover:bg-[var(--color-accent-blue)] hover:text-white transition-colors"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(cls.id)}
                                    className="p-2 bg-[var(--color-bg-darker)] rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
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
                                {editingClass ? 'Edit Class' : 'Add New Class'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X className="w-6 h-6 text-[var(--color-text-muted)] hover:text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Class Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Instructor</label>
                                    <input
                                        type="text"
                                        value={formData.instructor}
                                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
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
                                <label className="block text-sm font-medium mb-1">Registration Link (Optional)</label>
                                <input
                                    type="url"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                    >
                                        <option value="open">Open</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="closed">Closed / Full</option>
                                    </select>
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
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image</label>
                                    <label className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] border-dashed rounded-lg hover:border-[var(--color-accent-blue)] transition-colors h-[42px]">
                                        <Upload className="w-4 h-4" />
                                        <span className="text-sm">Upload</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>

                            {formData.image_url && (
                                <div className="w-full h-32 rounded-lg bg-gray-800 overflow-hidden relative">
                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}

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
                                            Save Class
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
