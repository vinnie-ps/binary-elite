'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type FeatureCard = Database['public']['Tables']['feature_cards']['Row']

export default function FeaturesPage() {
    const [features, setFeatures] = useState<FeatureCard[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingFeature, setEditingFeature] = useState<FeatureCard | null>(null)

    const supabase = createClient()

    useEffect(() => {
        fetchFeatures()
    }, [])

    const fetchFeatures = async () => {
        const { data } = await supabase
            .from('feature_cards')
            .select('*')
            .order('order_index', { ascending: true })

        if (data) setFeatures(data)
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this feature?')) return

        await supabase.from('feature_cards').delete().eq('id', id)
        fetchFeatures()
    }

    const toggleActive = async (feature: FeatureCard) => {
        await supabase
            .from('feature_cards')
            .update({ is_active: !feature.is_active })
            .eq('id', feature.id)

        fetchFeatures()
    }

    if (loading) {
        return <div className="text-center py-12">Loading...</div>
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-4xl font-semibold mb-2">Feature Cards</h1>
                    <p className="text-[var(--color-text-muted)]">Manage Learn/Build/Share cards</p>
                </div>
                <button
                    onClick={() => {
                        setEditingFeature(null)
                        setShowForm(true)
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[var(--color-accent-blue)] to-[#2563eb] text-white rounded-lg font-medium hover:opacity-90 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Feature
                </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature) => (
                    <div
                        key={feature.id}
                        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 backdrop-blur-[10px] text-center relative"
                    >
                        <div className="absolute top-4 right-4 flex gap-1">
                            <button
                                onClick={() => toggleActive(feature)}
                                className="p-1.5 hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-all"
                                title={feature.is_active ? 'Hide from public' : 'Show to public'}
                            >
                                {feature.is_active ? (
                                    <Eye className="w-4 h-4 text-green-400" />
                                ) : (
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setEditingFeature(feature)
                                    setShowForm(true)
                                }}
                                className="p-1.5 hover:bg-[rgba(59,130,246,0.1)] rounded-lg transition-all"
                            >
                                <Edit2 className="w-4 h-4 text-[var(--color-accent-blue)]" />
                            </button>
                            <button
                                onClick={() => handleDelete(feature.id)}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                        </div>

                        <div className="mb-6 h-16 flex items-center justify-center">
                            {feature.icon.startsWith('http') ? (
                                <img src={feature.icon} alt={feature.title} className="h-16 w-16 object-contain" />
                            ) : (
                                <span className="text-5xl">{feature.icon}</span>
                            )}
                        </div>
                        <h3 className="font-serif text-2xl font-semibold mb-3">{feature.title}</h3>
                        <p className="text-[var(--color-text-muted)]">{feature.description}</p>

                        {!feature.is_active && (
                            <div className="mt-4">
                                <span className="px-3 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/50">
                                    HIDDEN
                                </span>
                            </div>
                        )}
                    </div>
                ))}

                {features.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-[var(--color-text-muted)]">
                        No features yet. Click "Add Feature" to create one.
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <FeatureForm
                    feature={editingFeature}
                    onClose={() => {
                        setShowForm(false)
                        setEditingFeature(null)
                    }}
                    onSave={() => {
                        setShowForm(false)
                        setEditingFeature(null)
                        fetchFeatures()
                    }}
                />
            )}
        </div>
    )
}

// Feature Form Component
function FeatureForm({
    feature,
    onClose,
    onSave,
}: {
    feature: FeatureCard | null
    onClose: () => void
    onSave: () => void
}) {
    const [formData, setFormData] = useState({
        title: feature?.title || '',
        description: feature?.description || '',
        icon: feature?.icon || '🧠',
        order_index: feature?.order_index || 0,
        is_active: feature?.is_active ?? true,
    })
    const [saving, setSaving] = useState(false)

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        if (feature) {
            await supabase.from('feature_cards').update(formData).eq('id', feature.id)
        } else {
            await supabase.from('feature_cards').insert([formData])
        }

        setSaving(false)
        onSave()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 max-w-2xl w-full">
                <h2 className="font-serif text-3xl font-semibold mb-6">
                    {feature ? 'Edit Feature' : 'Add Feature'}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Icon (Image)</label>

                            <div className="flex items-start gap-4">
                                {formData.icon && !formData.icon.startsWith('http') ? (
                                    <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-lg text-3xl">
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
                                                const fileName = `feature-${Date.now()}.${fileExt}`
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
                                        Recommended: SVG or PNG, 64x64px
                                    </p>
                                </div>
                            </div>
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

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-bg-darker)]"
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
                            {saving ? 'Saving...' : 'Save Feature'}
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
