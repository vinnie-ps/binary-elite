'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)

    const supabase = createClient()

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        const { data } = await supabase
            .from('projects')
            .select('*')
            .order('order_index', { ascending: true })

        if (data) setProjects(data)
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return

        await supabase.from('projects').delete().eq('id', id)
        fetchProjects()
    }

    const toggleActive = async (project: Project) => {
        await supabase
            .from('projects')
            .update({ is_active: !project.is_active })
            .eq('id', project.id)

        fetchProjects()
    }

    const getBadgeColor = (status: string) => {
        const colors: Record<string, string> = {
            live: 'bg-green-500/20 text-green-400 border-green-500/50',
            mvp: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
            in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        }
        return colors[status] || colors.in_progress
    }

    if (loading) {
        return <div className="text-center py-12">Loading...</div>
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-4xl font-semibold mb-2">Projects</h1>
                    <p className="text-[var(--color-text-muted)]">Manage your featured projects</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProject(null)
                        setShowForm(true)
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[var(--color-accent-blue)] to-[#2563eb] text-white rounded-lg font-medium hover:opacity-90 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Project
                </button>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 backdrop-blur-[10px]"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4 flex-1">
                                <div className="text-4xl w-16 h-16 flex-shrink-0 flex items-start">
                                    {project.icon.startsWith('http') ? (
                                        <img src={project.icon} alt={project.title} className="w-12 h-12 object-contain rounded" />
                                    ) : (
                                        <span>{project.icon}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-serif text-2xl font-semibold">{project.title}</h3>
                                        <span className={`px-3 py-1 rounded text-xs font-medium border ${getBadgeColor(project.status)}`}>
                                            {project.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        {!project.is_active && (
                                            <span className="px-3 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/50">
                                                HIDDEN
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[var(--color-text-muted)] mb-3">{project.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.features.map((feature, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-[rgba(59,130,246,0.1)] text-[var(--color-accent-blue)] rounded-full text-sm"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleActive(project)}
                                    className="p-2 hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-all"
                                    title={project.is_active ? 'Hide from public' : 'Show to public'}
                                >
                                    {project.is_active ? (
                                        <Eye className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <EyeOff className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingProject(project)
                                        setShowForm(true)
                                    }}
                                    className="p-2 hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-all"
                                >
                                    <Edit2 className="w-5 h-5 text-[var(--color-accent-blue)]" />
                                </button>
                                <button
                                    onClick={() => handleDelete(project.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-5 h-5 text-red-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="text-center py-12 text-[var(--color-text-muted)]">
                        No projects yet. Click "Add Project" to create one.
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <ProjectForm
                    project={editingProject}
                    onClose={() => {
                        setShowForm(false)
                        setEditingProject(null)
                    }}
                    onSave={() => {
                        setShowForm(false)
                        setEditingProject(null)
                        fetchProjects()
                    }}
                />
            )}
        </div>
    )
}

// Project Form Component
function ProjectForm({
    project,
    onClose,
    onSave,
}: {
    project: Project | null
    onClose: () => void
    onSave: () => void
}) {
    const [formData, setFormData] = useState({
        title: project?.title || '',
        description: project?.description || '',
        icon: project?.icon || '📚',
        status: project?.status || 'in_progress',
        features: project?.features.join('\n') || '',
        order_index: project?.order_index || 0,
        is_active: project?.is_active ?? true,
        link: project?.link || '',
    })
    const [saving, setSaving] = useState(false)

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const data = {
            ...formData,
            features: formData.features.split('\n').filter(f => f.trim()),
        }

        if (project) {
            await supabase.from('projects').update(data).eq('id', project.id)
        } else {
            await supabase.from('projects').insert([data])
        }

        setSaving(false)
        onSave()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="font-serif text-3xl font-semibold mb-6">
                    {project ? 'Edit Project' : 'Add Project'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={3}
                            className="w-full px-4 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Project External Link (optional)</label>
                        <input
                            type="url"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            placeholder="https://github.com/... or https://project-demo.com"
                            className="w-full px-4 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Icon (Image)</label>

                            <div className="flex items-start gap-4">
                                {formData.icon && !formData.icon.startsWith('http') ? (
                                    <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-lg text-2xl">
                                        {formData.icon}
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 relative bg-gray-800 rounded-lg overflow-hidden border border-[var(--color-border)]">
                                        {formData.icon ? (
                                            <img
                                                src={formData.icon}
                                                alt="Icon"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                <span className="text-xs">No Icon</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex-1">
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-card)] transition-colors">
                                        <Upload className="w-4 h-4" />
                                        <span className="text-sm">Upload Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0]
                                                if (!file) return

                                                // Simple upload logic
                                                const fileExt = file.name.split('.').pop()
                                                const fileName = `project-${Date.now()}.${fileExt}`
                                                const { error: uploadError } = await supabase.storage
                                                    .from('site-assets')
                                                    .upload(fileName, file)

                                                if (uploadError) {
                                                    alert('Error uploading image: ' + uploadError.message)
                                                    return
                                                }

                                                const { data: { publicUrl } } = supabase.storage
                                                    .from('site-assets')
                                                    .getPublicUrl(fileName)

                                                setFormData({ ...formData, icon: publicUrl })
                                            }}
                                        />
                                    </label>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-2">
                                        Recommended: PNG or JPG, 128x128px
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                            >
                                <option value="live">Live</option>
                                <option value="mvp">MVP</option>
                                <option value="in_progress">In Progress</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Order</label>
                            <input
                                type="number"
                                value={formData.order_index}
                                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Features (one per line)</label>
                        <textarea
                            value={formData.features}
                            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                            required
                            rows={5}
                            placeholder="Learning Platforms&#10;AI Tutors & Tools&#10;Developer-Focused Education"
                            className="w-full px-4 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-bg-darker)] checked:bg-[var(--color-accent-blue)]"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium">
                            Show on public website
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 px-4 bg-gradient-to-br from-[var(--color-accent-blue)] to-[#2563eb] text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Project'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-[var(--color-border)] rounded-lg hover:bg-[rgba(59,130,246,0.1)] transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
