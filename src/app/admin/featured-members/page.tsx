'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Edit2, X, Save, Upload, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'

type Profile = {
    id: string
    full_name: string
    email: string
}

type FeaturedMember = {
    id: string
    profile_id: string
    gallery_bio: string | null
    role_in_community: string | null
    contributions: string[] | null
    profile_image_url: string | null
    social_links: any
    is_featured: boolean
    display_order: number
    profiles: Profile
}

function FeaturedMembersContent() {
    const [members, setMembers] = useState<FeaturedMember[]>([])
    const [allProfiles, setAllProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<FeaturedMember | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState({
        profile_id: '',
        gallery_bio: '',
        role_in_community: '',
        contributions: [''],
        profile_image_url: '',
        social_links: { twitter: '', linkedin: '', github: '', facebook: '', instagram: '', tiktok: '', youtube: '', portfolio: '' },
        is_featured: true,
        display_order: 0
    })

    const supabase = createClient()

    const searchParams = useSearchParams()
    const profileIdFromUrl = searchParams.get('profileId')

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (profileIdFromUrl && allProfiles.length > 0 && !isModalOpen && !editingMember) {
            const profile = allProfiles.find(p => p.id === profileIdFromUrl)
            if (profile) {
                setFormData(prev => ({
                    ...prev,
                    profile_id: profile.id
                }))
                setIsModalOpen(true)
            }
        }
    }, [profileIdFromUrl, allProfiles])

    const fetchData = async () => {
        const { data: membersData } = await supabase
            .from('featured_members')
            .select(`
                *,
                profiles!inner(id, full_name, email)
            `)
            .order('display_order', { ascending: true })

        if (membersData) setMembers(membersData as any)

        const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .order('full_name', { ascending: true })

        if (profilesData) setAllProfiles(profilesData)
        setLoading(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `profiles/${fileName}`

        setUploading(true)

        try {
            const { error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('site-assets')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, profile_image_url: publicUrl }))
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Error uploading image')
        } finally {
            setUploading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            profile_id: '',
            gallery_bio: '',
            role_in_community: '',
            contributions: [''],
            profile_image_url: '',
            social_links: { twitter: '', linkedin: '', github: '', facebook: '', instagram: '', tiktok: '', youtube: '', portfolio: '' },
            is_featured: true,
            display_order: 0
        })
        setEditingMember(null)
    }

    const openEditModal = (member: FeaturedMember) => {
        setEditingMember(member)
        setFormData({
            profile_id: member.profile_id,
            gallery_bio: member.gallery_bio || '',
            role_in_community: member.role_in_community || '',
            contributions: member.contributions || [''],
            profile_image_url: member.profile_image_url || '',
            social_links: {
                twitter: member.social_links?.twitter || '',
                linkedin: member.social_links?.linkedin || '',
                github: member.social_links?.github || '',
                facebook: member.social_links?.facebook || '',
                instagram: member.social_links?.instagram || '',
                tiktok: member.social_links?.tiktok || '',
                youtube: member.social_links?.youtube || '',
                portfolio: member.social_links?.portfolio || ''
            },
            is_featured: member.is_featured,
            display_order: member.display_order
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            ...formData,
            contributions: formData.contributions.filter(c => c.trim() !== '')
        }

        try {
            if (editingMember) {
                const { error } = await supabase
                    .from('featured_members')
                    .update(payload)
                    .eq('id', editingMember.id)
                if (error) throw error
            } else {
                // Check if already featured
                const { data: existing } = await supabase
                    .from('featured_members')
                    .select('id')
                    .eq('profile_id', formData.profile_id)
                    .single()

                if (existing) {
                    alert('This member is already featured. Please search for them and edit their entry instead.')
                    return
                }

                const { error } = await supabase
                    .from('featured_members')
                    .insert([payload])
                if (error) throw error
            }

            setIsModalOpen(false)
            resetForm()
            fetchData()
        } catch (error: any) {
            console.error('Error saving member:', JSON.stringify(error, null, 2))
            alert(error.message || 'Error saving member. Check console for details.')
        }
    }

    const handleDelete = async (id: string, profileId: string) => {
        if (!confirm('Are you sure you want to remove this member from the featured list?')) return

        try {
            const { error } = await supabase
                .from('featured_members')
                .delete()
                .eq('id', id)

            if (error) throw error

            fetchData()
        } catch (error) {
            console.error('Error deleting member:', error)
            alert('Error deleting member')
        }
    }

    const filteredMembers = members.filter(m =>
        m.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-semibold mb-2">Featured Members</h1>
                    <p className="text-[var(--color-text-muted)]">Manage the "Elite Tech Minds" gallery on the landing page.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true) }}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-blue)] text-white rounded-lg hover:opacity-90 active:scale-95 transition-all font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Member
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-accent-blue)] focus:border-transparent transition-all outline-none"
                />
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <div className="space-y-4">
                    {filteredMembers.map((member) => (
                        <div key={member.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4 flex items-center justify-between group hover:border-[var(--color-accent-blue)] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="font-mono text-[var(--color-text-muted)] w-6 text-center">#{member.display_order}</div>
                                <div className="w-12 h-12 rounded-full border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-darker)] relative">
                                    {member.profile_image_url ? (
                                        <Image src={member.profile_image_url} alt={member.profiles.full_name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-text-muted)]">N/A</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{member.profiles.full_name}</h3>
                                    <p className="text-sm text-[var(--color-text-muted)]">{member.role_in_community || 'No role set'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`px-2 py-1 rounded text-xs font-medium ${member.is_featured ? 'bg-green-500/10 text-green-400' : 'bg-gray-700/50 text-gray-400'}`}>
                                    {member.is_featured ? 'Active' : 'Hidden'}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(member)}
                                        className="p-2 hover:bg-[var(--color-bg-darker)] rounded-lg text-[var(--color-accent-blue)] transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member.id, member.profile_id)}
                                        className="p-2 hover:bg-[var(--color-bg-darker)] rounded-lg text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredMembers.length === 0 && (
                        <div className="text-center py-12 text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl border-dashed">
                            No members found.
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[var(--color-bg-card)] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--color-border)] shadow-2xl">
                        <div className="sticky top-0 bg-[var(--color-bg-card)] p-6 border-b border-[var(--color-border)] flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold">{editingMember ? 'Edit Featured Member' : 'Add Featured Member'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--color-bg-darker)] rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Profile Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Select Member</label>
                                    <select
                                        value={formData.profile_id}
                                        onChange={(e) => setFormData({ ...formData, profile_id: e.target.value })}
                                        disabled={!!editingMember}
                                        required
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm disabled:opacity-50"
                                    >
                                        <option value="">Select a user...</option>
                                        {allProfiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Gallery Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg flex items-center justify-center overflow-hidden relative">
                                        {formData.profile_image_url ? (
                                            <Image src={formData.profile_image_url} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <Search className="w-6 h-6 text-gray-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-dark)] transition-colors w-fit">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm">Upload Image</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                        </label>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-2">Recommended: 400x400px squared image.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Role in Community</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Lead Instructor"
                                        value={formData.role_in_community}
                                        onChange={(e) => setFormData({ ...formData, role_in_community: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Short Bio</label>
                                    <input
                                        type="text"
                                        placeholder="Brief introduction..."
                                        value={formData.gallery_bio}
                                        onChange={(e) => setFormData({ ...formData, gallery_bio: e.target.value })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            {/* Contributions */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Contributions (One per line)</label>
                                <div className="space-y-2">
                                    {formData.contributions.map((contribution, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={contribution}
                                                onChange={(e) => {
                                                    const newContributions = [...formData.contributions]
                                                    newContributions[index] = e.target.value
                                                    setFormData({ ...formData, contributions: newContributions })
                                                }}
                                                className="flex-1 px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newContributions = formData.contributions.filter((_, i) => i !== index)
                                                    setFormData({ ...formData, contributions: newContributions })
                                                }}
                                                className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, contributions: [...formData.contributions, ''] })}
                                        className="text-xs text-[var(--color-accent-blue)] font-medium hover:underline"
                                    >
                                        + Add Contribution
                                    </button>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Social Links</label>
                                <div className="space-y-3">
                                    <input
                                        type="url"
                                        placeholder="Portfolio URL (e.g. personal website)"
                                        value={formData.social_links.portfolio}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            social_links: { ...formData.social_links, portfolio: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm border-l-4 border-l-[var(--color-accent-blue)]"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.keys(formData.social_links).filter(k => k !== 'portfolio').map((platform) => (
                                            <input
                                                key={platform}
                                                type="url"
                                                placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                                                value={formData.social_links[platform as keyof typeof formData.social_links]}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    social_links: { ...formData.social_links, [platform]: e.target.value }
                                                })}
                                                className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Toggle */}
                            <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-darker)] rounded-xl border border-[var(--color-border)]">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-5 h-5 accent-[var(--color-accent-blue)]"
                                />
                                <div>
                                    <p className="font-medium text-sm">Feature on Landing Page</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">Uncheck to hide this member from the public gallery.</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium hover:bg-[var(--color-bg-darker)] rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-6 py-2 bg-[var(--color-accent-blue)] text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    {uploading ? 'Uploading...' : 'Save Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function AdminFeaturedMembersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-[var(--color-text-muted)]">Loading Admin Dashboard...</div>}>
            <FeaturedMembersContent />
        </Suspense>
    )
}
