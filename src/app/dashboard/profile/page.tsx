'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, Upload, X, Camera, ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'

type Profile = {
    id: string
    full_name: string
    mobile_number: string
    location: string
    joining_reason: string
    experience_level: string
    website_link: string
    profile_photo_url: string
    portfolio_images: string[]
    consent_to_feature: boolean
}

export default function ProfilePage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState<Profile>({
        id: '',
        full_name: '',
        mobile_number: '',
        location: '',
        joining_reason: '',
        experience_level: '',
        website_link: '',
        profile_photo_url: '',
        portfolio_images: [],
        consent_to_feature: false
    })

    const fileInputRef = useRef<HTMLInputElement>(null)
    const portfolioInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }
        setUserId(user.id)

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (data) {
            // Protect Route: If not active, redirect to dashboard
            if (data.status !== 'active') {
                router.push('/dashboard')
                return
            }

            setFormData({
                id: data.id,
                full_name: data.full_name || '',
                mobile_number: data.mobile_number || '',
                location: data.location || '',
                joining_reason: data.joining_reason || '',
                experience_level: data.experience_level || '',
                website_link: data.website_link || '',
                profile_photo_url: data.profile_photo_url || '',
                portfolio_images: data.portfolio_images || [],
                consent_to_feature: data.consent_to_feature || false
            })
        }
        setLoading(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }))
    }

    const uploadFile = async (file: File, path: string) => {
        const { data, error } = await supabase.storage
            .from('member-uploads')
            .upload(path, file, { upsert: true })

        if (error) {
            console.error('Upload Error:', error)
            alert('Error uploading file')
            return null
        }

        const { data: { publicUrl } } = supabase.storage
            .from('member-uploads')
            .getPublicUrl(path)

        return publicUrl
    }

    const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !userId) return

        const file = e.target.files[0]
        const path = `${userId}/profile_${Date.now()}_${file.name}`
        const url = await uploadFile(file, path)

        if (url) {
            setFormData(prev => ({ ...prev, profile_photo_url: url }))
        }
    }

    const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !userId) return

        const files = Array.from(e.target.files)
        const newImages: string[] = []

        for (const file of files) {
            const path = `${userId}/portfolio_${Date.now()}_${file.name}`
            const url = await uploadFile(file, path)
            if (url) newImages.push(url)
        }

        setFormData(prev => ({
            ...prev,
            portfolio_images: [...prev.portfolio_images, ...newImages]
        }))

        // Reset input
        if (portfolioInputRef.current) portfolioInputRef.current.value = ''
    }

    const removePortfolioImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            portfolio_images: prev.portfolio_images.filter((_, index) => index !== indexToRemove)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: formData.full_name,
                mobile_number: formData.mobile_number,
                location: formData.location,
                joining_reason: formData.joining_reason,
                experience_level: formData.joining_reason === 'partner' ? formData.experience_level : null,
                website_link: formData.joining_reason === 'partner' ? formData.website_link : null,
                profile_photo_url: formData.profile_photo_url,
                portfolio_images: formData.joining_reason === 'partner' ? formData.portfolio_images : [],
                consent_to_feature: formData.joining_reason === 'partner' ? formData.consent_to_feature : false,
            })
            .eq('id', userId)

        setSaving(false)
        if (error) {
            alert('Error saving profile')
        } else {
            router.push('/dashboard')
        }
    }

    if (loading) {
        return <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center text-white">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 rounded-full hover:bg-[var(--color-bg-card)] transition-colors text-[var(--color-text-secondary)]">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-white">Edit Profile</h1>
                        <p className="text-[var(--color-text-muted)]">Update your information and portfolio.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <section className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 backdrop-blur-md">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm">1</span>
                            Basic Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Profile Photo */}
                            <div className="md:col-span-2 flex justify-center mb-4">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--color-border)] group-hover:border-[var(--color-accent-blue)] transition-colors bg-[var(--color-bg-darker)]">
                                        {formData.profile_photo_url ? (
                                            <img src={formData.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                                                <User className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleProfilePhotoUpload}
                                    />
                                    <p className="text-xs text-center mt-2 text-[var(--color-text-muted)]">Click to upload photo</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    required
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-darker)] border border-[var(--color-border)] focus:border-[var(--color-accent-blue)] outline-none transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Mobile Number</label>
                                <input
                                    type="tel"
                                    name="mobile_number"
                                    value={formData.mobile_number}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-darker)] border border-[var(--color-border)] focus:border-[var(--color-accent-blue)] outline-none transition-colors"
                                    placeholder="+1 234 567 890"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-darker)] border border-[var(--color-border)] focus:border-[var(--color-accent-blue)] outline-none transition-colors"
                                    placeholder="City, Country"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Why are you here?</label>
                                <select
                                    name="joining_reason"
                                    required
                                    value={formData.joining_reason}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-darker)] border border-[var(--color-border)] focus:border-[var(--color-accent-blue)] outline-none transition-colors text-white"
                                >
                                    <option value="" disabled>Select a reason</option>
                                    <option value="buy">I want to buy tools</option>
                                    <option value="learn">I want to learn tech</option>
                                    <option value="explore">Just exploring</option>
                                    <option value="partner">I want to partner / Build tools</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Partner Specific Section */}
                    {formData.joining_reason === 'partner' && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 backdrop-blur-md"
                        >
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 text-sm">2</span>
                                Partner Portfolio
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">Experience Level</label>
                                    <textarea
                                        name="experience_level"
                                        rows={3}
                                        value={formData.experience_level}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-darker)] border border-[var(--color-border)] focus:border-[var(--color-accent-blue)] outline-none transition-colors"
                                        placeholder="Tell us about your tech stack and experience..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">Portfolio Website</label>
                                    <input
                                        type="url"
                                        name="website_link"
                                        value={formData.website_link}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-darker)] border border-[var(--color-border)] focus:border-[var(--color-accent-blue)] outline-none transition-colors"
                                        placeholder="https://your-portfolio.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">Portfolio Images</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {formData.portfolio_images.map((img, index) => (
                                            <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-[var(--color-border)]">
                                                <img src={img} alt={`Portfolio ${index}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removePortfolioImage(index)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <div
                                            onClick={() => portfolioInputRef.current?.click()}
                                            className="aspect-video rounded-lg border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-accent-blue)] hover:bg-[rgba(59,130,246,0.05)] transition-all"
                                        >
                                            <Upload className="w-6 h-6 text-[var(--color-text-muted)] mb-2" />
                                            <span className="text-xs text-[var(--color-text-muted)]">Add Image</span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={portfolioInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePortfolioUpload}
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-darker)] rounded-lg border border-[var(--color-border)]">
                                    <input
                                        type="checkbox"
                                        name="consent_to_feature"
                                        id="consent"
                                        checked={formData.consent_to_feature}
                                        onChange={handleCheckboxChange}
                                        className="w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-accent-blue)] focus:ring-[var(--color-accent-blue)]"
                                    />
                                    <label htmlFor="consent" className="text-sm text-[var(--color-text-secondary)] cursor-pointer select-none">
                                        I consent to having my portfolio featured on the landing page for potential advertising.
                                    </label>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    <div className="flex justify-end gap-4">
                        <Link href="/dashboard" className="px-6 py-3 rounded-lg border border-[var(--color-border)] font-medium hover:bg-[var(--color-bg-card)] transition-colors">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[var(--color-accent-blue)] text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
