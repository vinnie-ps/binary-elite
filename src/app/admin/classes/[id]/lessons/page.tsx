'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Search, Edit2, Trash2, X, Save, ArrowLeft, BookOpen } from 'lucide-react'

type Lesson = {
    id: string
    title: string
    description: string | null
    duration: number | null
    video_url: string | null
    order_index: number
    is_locked: boolean
}

export default function AdminLessonsPage() {
    const params = useParams()
    const router = useRouter()
    const classId = params.id as string

    const [lessons, setLessons] = useState<Lesson[]>([])
    const [classData, setClassData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        video_url: '',
        is_locked: false
    })

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [classId])

    const fetchData = async () => {
        // Fetch class info
        const { data: classInfo } = await supabase
            .from('classes')
            .select('*')
            .eq('id', classId)
            .single()

        if (classInfo) setClassData(classInfo)

        // Fetch lessons
        const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .eq('class_id', classId)
            .order('order_index', { ascending: true })

        if (lessonsData) setLessons(lessonsData)
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            ...formData,
            class_id: classId,
            duration: formData.duration ? parseInt(formData.duration) : null,
            order_index: editingLesson ? editingLesson.order_index : lessons.length
        }

        try {
            if (editingLesson) {
                const { error } = await supabase
                    .from('lessons')
                    .update(payload)
                    .eq('id', editingLesson.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('lessons')
                    .insert([payload])
                if (error) throw error
            }

            setIsModalOpen(false)
            setEditingLesson(null)
            resetForm()
            fetchData()
        } catch (error) {
            console.error('Error saving lesson:', error)
            alert('Error saving lesson')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lesson?')) return

        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting lesson:', error)
            alert('Error deleting lesson')
        } else {
            fetchData()
        }
    }

    const openEditModal = (lesson: Lesson) => {
        setEditingLesson(lesson)
        setFormData({
            title: lesson.title,
            description: lesson.description || '',
            duration: lesson.duration?.toString() || '',
            video_url: lesson.video_url || '',
            is_locked: lesson.is_locked
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            duration: '',
            video_url: '',
            is_locked: false
        })
    }

    const filteredLessons = lessons.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col gap-4 mb-8">
                <button
                    onClick={() => router.push('/admin/classes')}
                    className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Classes
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-bold mb-2">
                            {classData?.title} - Lessons
                        </h1>
                        <p className="text-[var(--color-text-muted)]">Manage course lessons and content</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingLesson(null)
                            resetForm()
                            setIsModalOpen(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-blue)] text-white rounded-lg hover:opacity-90 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Lesson
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input
                    type="text"
                    placeholder="Search lessons..."
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
                    {filteredLessons.length === 0 ? (
                        <div className="text-center py-12 text-[var(--color-text-muted)]">
                            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No lessons yet. Add your first lesson to get started!</p>
                        </div>
                    ) : (
                        filteredLessons.map((lesson, index) => (
                            <div key={lesson.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 flex items-center gap-6 group hover:border-[var(--color-accent-blue)] transition-colors">
                                <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-darker)] flex-shrink-0 flex items-center justify-center font-bold text-lg">
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1">{lesson.title}</h3>
                                    {lesson.description && (
                                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-1 mb-2">{lesson.description}</p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                                        {lesson.duration && <span>{lesson.duration} min</span>}
                                        {lesson.video_url && (
                                            <>
                                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                                <span className="text-blue-400">Video attached</span>
                                            </>
                                        )}
                                        {lesson.is_locked && (
                                            <>
                                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                                <span className="text-yellow-400">Locked</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(lesson)}
                                        className="p-2 bg-[var(--color-bg-darker)] rounded-lg hover:bg-[var(--color-accent-blue)] hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(lesson.id)}
                                        className="p-2 bg-[var(--color-bg-darker)] rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                            <h2 className="text-xl font-bold font-serif">
                                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X className="w-6 h-6 text-[var(--color-text-muted)] hover:text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Lesson Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                />
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_locked}
                                            onChange={(e) => setFormData({ ...formData, is_locked: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">Lock this lesson</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Video URL</label>
                                <input
                                    type="url"
                                    placeholder="https://youtube.com/watch?v=... or direct video link"
                                    value={formData.video_url}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent-blue)]"
                                />
                                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                    Supports YouTube, Vimeo, or direct video links
                                </p>
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
                                    Save Lesson
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
