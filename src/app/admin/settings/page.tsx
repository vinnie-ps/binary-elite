'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Upload, X } from 'lucide-react'

type Setting = {
    id: string
    setting_key: string
    setting_value: string
    setting_type: string
}

type SubscriptionTier = {
    id: string
    name: string
    display_name: string
    price_monthly: number
    price_yearly: number
    currency: string
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [uploading, setUploading] = useState<string | null>(null)

    const [tiers, setTiers] = useState<SubscriptionTier[]>([])
    const [tiersLoading, setTiersLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        fetchSettings()
        fetchTiers()
    }, [])

    const fetchSettings = async () => {
        const { data } = await supabase
            .from('site_settings')
            .select('*')

        if (data) {
            const settingsMap: Record<string, string> = {}
            data.forEach((setting: Setting) => {
                settingsMap[setting.setting_key] = setting.setting_value
            })
            setSettings(settingsMap)
        }
        setLoading(false)
    }

    const fetchTiers = async () => {
        const { data } = await supabase
            .from('subscription_tiers')
            .select('*')
            .order('price_monthly', { ascending: true })

        if (data) {
            setTiers(data)
        }
        setTiersLoading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        setSaved(false)

        try {
            // 1. Update Site Settings
            for (const [key, value] of Object.entries(settings)) {
                await supabase
                    .from('site_settings')
                    .update({ setting_value: value })
                    .eq('setting_key', key)
            }

            // 2. Update Subscription Tiers
            for (const tier of tiers) {
                await supabase
                    .from('subscription_tiers')
                    .update({
                        display_name: tier.display_name,
                        price_monthly: tier.price_monthly,
                        price_yearly: tier.price_yearly
                    })
                    .eq('id', tier.id)
            }

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (error) {
            console.error('Error saving settings:', error)
            alert('Error saving settings')
        } finally {
            setSaving(false)
        }
    }

    const handleTierChange = (id: string, field: keyof SubscriptionTier, value: any) => {
        setTiers(prev => prev.map(tier =>
            tier.id === id ? { ...tier, [field]: value } : tier
        ))
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(key)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${key}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('site-assets')
                .getPublicUrl(filePath)

            setSettings({ ...settings, [key]: publicUrl })
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Error uploading file!')
        } finally {
            setUploading(null)
        }
    }

    const removeFile = (key: string) => {
        setSettings({ ...settings, [key]: '' })
    }

    if (loading) {
        return <div className="text-center py-12">Loading...</div>
    }

    const settingGroups = [
        {
            title: 'Hero Section',
            settings: [
                { key: 'hero_title', label: 'Title', type: 'text' },
                { key: 'hero_tagline', label: 'Tagline', type: 'text' },
                { key: 'hero_description', label: 'Description', type: 'textarea' },
                { key: 'hero_video_url', label: 'Background Video', type: 'file', accept: 'video/mp4,video/webm' },
                { key: 'secondary_logo_url', label: 'Secondary Logo', type: 'file', accept: 'image/*' },
            ],
        },
        {
            title: 'About Section',
            settings: [
                { key: 'about_title', label: 'Title', type: 'text' },
                { key: 'about_subtitle', label: 'Subtitle', type: 'text' },
                { key: 'about_description', label: 'Description', type: 'textarea' },
            ],
        },
        {
            title: 'Projects Section',
            settings: [
                { key: 'projects_title', label: 'Title', type: 'text' },
                { key: 'projects_subtitle', label: 'Subtitle', type: 'text' },
            ],
        },
        {
            title: 'Exclusive Section',
            settings: [
                { key: 'exclusive_title', label: 'Title', type: 'text' },
                { key: 'exclusive_statement', label: 'Statement', type: 'textarea' },
            ],
        },
        {
            title: 'Footer',
            settings: [
                { key: 'footer_text', label: 'Footer Text', type: 'text' },
            ],
        },
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-4xl font-semibold mb-2">Site Settings</h1>
                    <p className="text-[var(--color-text-muted)]">Customize your landing page content</p>
                </div>
                <div className="flex items-center gap-4">
                    {saved && (
                        <span className="text-green-400 text-sm">✓ Saved successfully</span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[var(--color-accent-blue)] to-[#2563eb] text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Subscription Tiers Section */}
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 backdrop-blur-[10px]">
                    <h2 className="font-serif text-2xl font-semibold mb-6">Subscription Plans</h2>
                    {tiersLoading ? (
                        <p>Loading plans...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {tiers.map((tier) => (
                                <div key={tier.id} className="p-4 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-xl">
                                    <div className="mb-4">
                                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">Plan Name</label>
                                        <input
                                            type="text"
                                            value={tier.display_name}
                                            onChange={(e) => handleTierChange(tier.id, 'display_name', e.target.value)}
                                            className="w-full px-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-sm font-bold"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Monthly ($)</label>
                                            <input
                                                type="number"
                                                value={tier.price_monthly}
                                                onChange={(e) => handleTierChange(tier.id, 'price_monthly', e.target.value)}
                                                className="w-full px-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Yearly ($)</label>
                                            <input
                                                type="number"
                                                value={tier.price_yearly}
                                                onChange={(e) => handleTierChange(tier.id, 'price_yearly', e.target.value)}
                                                className="w-full px-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {settingGroups.map((group) => (
                    <div
                        key={group.title}
                        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 backdrop-blur-[10px]"
                    >
                        <h2 className="font-serif text-2xl font-semibold mb-6">{group.title}</h2>
                        <div className="space-y-6">
                            {group.settings.map((setting) => (
                                <div key={setting.key}>
                                    <label className="block text-sm font-medium mb-2">
                                        {setting.label}
                                    </label>

                                    {setting.type === 'textarea' ? (
                                        <textarea
                                            value={settings[setting.key] || ''}
                                            onChange={(e) =>
                                                setSettings({ ...settings, [setting.key]: e.target.value })
                                            }
                                            rows={3}
                                            className="w-full px-4 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] transition-all"
                                        />
                                    ) : setting.type === 'file' ? (
                                        <div className="space-y-2">
                                            {/* Preview / Current URL */}
                                            {settings[setting.key] ? (
                                                <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg">
                                                    <span className="flex-1 truncate text-sm text-[var(--color-text-secondary)]">
                                                        {settings[setting.key]}
                                                    </span>
                                                    <a
                                                        href={settings[setting.key]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[var(--color-accent-blue)] hover:underline text-sm"
                                                    >
                                                        View
                                                    </a>
                                                    <button
                                                        onClick={() => removeFile(setting.key)}
                                                        className="p-1 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : null}

                                            {/* File Input */}
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept={(setting as any).accept}
                                                    onChange={(e) => handleFileUpload(e, setting.key)}
                                                    disabled={uploading === setting.key}
                                                    className="hidden"
                                                    id={`file-${setting.key}`}
                                                />
                                                <label
                                                    htmlFor={`file-${setting.key}`}
                                                    className={`
                                                        flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-[var(--color-border)] rounded-lg cursor-pointer transition-all
                                                        ${uploading === setting.key ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--color-accent-blue)] hover:bg-[var(--color-bg-darker)]'}
                                                    `}
                                                >
                                                    {uploading === setting.key ? (
                                                        <span className="text-sm">Uploading...</span>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4 text-[var(--color-text-muted)]" />
                                                            <span className="text-sm text-[var(--color-text-secondary)]">
                                                                Click to upload {setting.label}
                                                            </span>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={settings[setting.key] || ''}
                                            onChange={(e) =>
                                                setSettings({ ...settings, [setting.key]: e.target.value })
                                            }
                                            className="w-full px-4 py-3 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)] transition-all"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
