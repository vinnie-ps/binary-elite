'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Upload, User, Award, ExternalLink, X, Twitter, Linkedin, Github, Facebook, Instagram, Youtube, Music, Globe } from 'lucide-react'
import Image from 'next/image'

type Profile = {
    id: string
    full_name: string | null
    email: string
    profile_photo_url: string | null
}

type FeaturedInfo = {
    id?: string
    gallery_bio: string
    role_in_community: string
    contributions: string[]
    social_links: {
        twitter: string
        linkedin: string
        github: string
        facebook: string
        instagram: string
        tiktok: string
        youtube: string
        portfolio: string
    }
    is_featured: boolean
    profile_image_url: string
}

export default function AdminProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    // Base Profile Data
    const [profile, setProfile] = useState<Profile>({
        id: '',
        full_name: '',
        email: '',
        profile_photo_url: ''
    })

    // Featured Gallery Data
    const [featured, setFeatured] = useState<FeaturedInfo>({
        gallery_bio: '',
        role_in_community: '',
        contributions: [''],
        social_links: { twitter: '', linkedin: '', github: '', facebook: '', instagram: '', tiktok: '', youtube: '', portfolio: '' },
        is_featured: false,
        profile_image_url: ''
    })

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setUserId(user.id)

        // 1. Fetch Profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileData) {
            setProfile({
                id: profileData.id,
                full_name: profileData.full_name || '',
                email: profileData.email || user.email || '',
                profile_photo_url: profileData.profile_photo_url || ''
            })
        }

        // 2. Fetch Featured Entry
        const { data: featuredData } = await supabase
            .from('featured_members')
            .select('*')
            .eq('profile_id', user.id)
            .single()

        if (featuredData) {
            setFeatured({
                id: featuredData.id,
                gallery_bio: featuredData.gallery_bio || '',
                role_in_community: featuredData.role_in_community || '',
                contributions: featuredData.contributions || [''],
                social_links: {
                    twitter: featuredData.social_links?.twitter || '',
                    linkedin: featuredData.social_links?.linkedin || '',
                    github: featuredData.social_links?.github || '',
                    facebook: featuredData.social_links?.facebook || '',
                    instagram: featuredData.social_links?.instagram || '',
                    tiktok: featuredData.social_links?.tiktok || '',
                    youtube: featuredData.social_links?.youtube || '',
                    portfolio: featuredData.social_links?.portfolio || ''
                },
                is_featured: featuredData.is_featured || false,
                profile_image_url: featuredData.profile_image_url || ''
            })
        }

        setLoading(false)
    }

    const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | 'gallery') => {
        const file = e.target.files?.[0]
        if (!file || !userId) return

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}-${target}-${Date.now()}.${fileExt}`
            const filePath = `profiles/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('site-assets')
                .getPublicUrl(filePath)

            if (target === 'profile') {
                setProfile(prev => ({ ...prev, profile_photo_url: publicUrl }))
            } else {
                setFeatured(prev => ({ ...prev, profile_image_url: publicUrl }))
            }
        } catch (error) {
            console.error('Error uploading:', error)
            alert('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        if (!userId) return
        setSaving(true)

        try {
            // 1. Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    profile_photo_url: profile.profile_photo_url,
                    // is_featured sync removed (unified system)
                })
                .eq('id', userId)

            if (profileError) throw profileError

            // 2. Upsert Featured Member
            const featuredPayload = {
                profile_id: userId,
                gallery_bio: featured.gallery_bio,
                role_in_community: featured.role_in_community,
                contributions: featured.contributions.filter(c => c.trim() !== ''),
                profile_image_url: featured.profile_image_url || profile.profile_photo_url, // Fallback to main profile photo
                social_links: featured.social_links,
                is_featured: featured.is_featured,
                // If it's a new entry, put it at the end? Or default 0.
                display_order: featured.id ? undefined : 99
            }

            // Clean undefined if updating
            if (featured.id) {
                // @ts-ignore
                delete featuredPayload.display_order
            }

            if (featured.id) {
                const { error } = await supabase
                    .from('featured_members')
                    .update(featuredPayload)
                    .eq('id', featured.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('featured_members')
                    .insert([featuredPayload])
                if (error) throw error
            }

            alert('Profile saved successfully!')
            fetchData() // Refresh to get IDs etc
        } catch (error: any) {
            console.error('Error saving:', error)
            alert(error.message || 'Error saving profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8">Loading profile...</div>

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <h1 className="font-serif text-4xl font-semibold mb-2">My Information</h1>
            <p className="text-[var(--color-text-muted)] mb-8">Manage your admin profile and public gallery appearance</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT: Basic Profile */}
                <div className="space-y-8">
                    <section className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-5 h-5 text-[var(--color-accent-blue)]" />
                            <h2 className="text-xl font-bold">Internal Profile</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Photo */}
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-[var(--color-bg-darker)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center relative group">
                                    {profile.profile_photo_url ? (
                                        <Image src={profile.profile_photo_url} alt="Profile" fill className="object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-gray-500" />
                                    )}
                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                        <Upload className="w-5 h-5 text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleProfileUpload(e, 'profile')} disabled={uploading} />
                                    </label>
                                </div>
                                <div>
                                    <p className="font-medium">Profile Photo</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">Used for internal admin views</p>
                                </div>
                            </div>

                            {/* Fields */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.full_name || ''}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg opacity-50 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* RIGHT: Featured Gallery */}
                <div className="space-y-8">
                    <section className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 relative overflow-hidden">
                        {/* Status Banner */}
                        <div className={`absolute top-0 right-0 px-4 py-1 text-xs font-bold rounded-bl-xl ${featured.is_featured ? 'bg-[var(--color-accent-blue)] text-white' : 'bg-[var(--color-bg-darker)] text-[var(--color-text-muted)] border-l border-b border-[var(--color-border)]'
                            }`}>
                            {featured.is_featured ? 'LIVE IN GALLERY' : 'HIDDEN FROM GALLERY'}
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <Award className="w-5 h-5 text-purple-400" />
                            <h2 className="text-xl font-bold">Gallery Appearance</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Toggle */}
                            <label className="flex items-center gap-3 p-4 bg-[var(--color-bg-darker)] rounded-xl border border-[var(--color-border)] cursor-pointer hover:border-purple-500/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={featured.is_featured}
                                    onChange={(e) => setFeatured({ ...featured, is_featured: e.target.checked })}
                                    className="w-5 h-5 accent-purple-500"
                                />
                                <div>
                                    <p className="font-medium">Show in "Elite Tech Minds"</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">Enable this to appear on the landing page</p>
                                </div>
                            </label>

                            {/* Gallery Photo */}
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-[var(--color-bg-darker)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center relative group">
                                    {featured.profile_image_url ? (
                                        <Image src={featured.profile_image_url} alt="Gallery" fill className="object-cover" />
                                    ) : (
                                        <Award className="w-8 h-8 text-purple-500/30" />
                                    )}
                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                        <Upload className="w-5 h-5 text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleProfileUpload(e, 'gallery')} disabled={uploading} />
                                    </label>
                                </div>
                                <div>
                                    <p className="font-medium">Gallery Photo</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">Defaults to Profile Photo if empty</p>
                                </div>
                            </div>

                            {/* Fields */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Community Role</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Lead Instructor"
                                    value={featured.role_in_community}
                                    onChange={(e) => setFeatured({ ...featured, role_in_community: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Short Bio</label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief introduction for the gallery..."
                                    value={featured.gallery_bio}
                                    onChange={(e) => setFeatured({ ...featured, gallery_bio: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg"
                                />
                            </div>

                            {/* Contributions */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Top Contributions</label>
                                <div className="space-y-2">
                                    {featured.contributions.map((c, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={c}
                                                onChange={(e) => {
                                                    const newArr = [...featured.contributions]
                                                    newArr[i] = e.target.value
                                                    setFeatured({ ...featured, contributions: newArr })
                                                }}
                                                className="flex-1 px-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg"
                                            />
                                            <button
                                                onClick={() => setFeatured({ ...featured, contributions: featured.contributions.filter((_, idx) => idx !== i) })}
                                                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setFeatured({ ...featured, contributions: [...featured.contributions, ''] })}
                                        className="text-sm text-[var(--color-accent-blue)] flex items-center gap-1"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                            </div>

                            {/* Social Links Grid */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Social Links</label>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute left-3 top-2.5 text-[var(--color-accent-blue)]">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="url"
                                            placeholder="My Portfolio URL (e.g. personal website)"
                                            value={featured.social_links.portfolio}
                                            onChange={(e) => setFeatured({
                                                ...featured,
                                                social_links: { ...featured.social_links, portfolio: e.target.value }
                                            })}
                                            className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-accent-blue)]/50 rounded-lg text-sm focus:border-[var(--color-accent-blue)] outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {Object.entries(featured.social_links).filter(([key]) => key !== 'portfolio').map(([key, val]) => (
                                            <div key={key} className="relative">
                                                <div className="absolute left-3 top-2.5 text-[var(--color-text-muted)]">
                                                    {key === 'twitter' && <Twitter className="w-4 h-4" />}
                                                    {key === 'linkedin' && <Linkedin className="w-4 h-4" />}
                                                    {key === 'github' && <Github className="w-4 h-4" />}
                                                    {key === 'facebook' && <Facebook className="w-4 h-4" />}
                                                    {key === 'instagram' && <Instagram className="w-4 h-4" />}
                                                    {key === 'youtube' && <Youtube className="w-4 h-4" />}
                                                    {key === 'tiktok' && <Music className="w-4 h-4" />}
                                                </div>
                                                <input
                                                    type="url"
                                                    placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} URL`}
                                                    value={val}
                                                    onChange={(e) => setFeatured({
                                                        ...featured,
                                                        social_links: { ...featured.social_links, [key]: e.target.value }
                                                    })}
                                                    className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </section>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--color-accent-blue)] to-purple-600 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    )
}
