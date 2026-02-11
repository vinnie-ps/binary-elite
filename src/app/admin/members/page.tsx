'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, UserCheck, UserX, User, Shield, Briefcase, Mail, Phone, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

type Profile = {
    id: string
    email: string
    role: string
    status: string
    full_name: string | null
    mobile_number: string | null
    location: string | null
    joining_reason: string | null
    experience_level: string | null
    website_link: string | null
    profile_photo_url: string | null
    portfolio_images: string[] | null
    consent_to_feature: boolean | null
    is_featured: boolean | null
    billing_plan?: string
    billing_status?: string
    created_at?: string
}

export default function MembersPage() {
    const [members, setMembers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedMember, setSelectedMember] = useState<Profile | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const supabase = createClient()

    useEffect(() => {
        fetchMembers()
    }, [refreshTrigger])

    const fetchMembers = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'member') // Only fetch members, not admins
            .order('created_at', { ascending: false } as any) // Cast to any if created_at is not in types yet

        if (data) {
            setMembers(data)
        }
        setLoading(false)
    }

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

        // Get member details for email
        const member = members.find(m => m.id === id)

        const { error } = await supabase
            .from('profiles')
            .update({ status: newStatus })
            .eq('id', id)

        if (!error) {
            // Send activation email if member is being activated
            if (newStatus === 'active' && member) {
                try {
                    await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'activated',
                            data: {
                                name: member.full_name || member.email?.split('@')[0] || 'Member',
                                email: member.email,
                            },
                        }),
                    })
                } catch (emailError) {
                    console.error('Failed to send activation email:', emailError)
                }
            }

            setRefreshTrigger(prev => prev + 1)
            // Update selected member if open
            if (selectedMember && selectedMember.id === id) {
                setSelectedMember(prev => prev ? ({ ...prev, status: newStatus }) : null)
            }
        } else {
            alert('Error updating status')
        }
    }

    const updateBilling = async (id: string, field: 'billing_plan' | 'billing_status', value: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ [field]: value })
            .eq('id', id)

        if (!error) {
            setRefreshTrigger(prev => prev + 1)
            if (selectedMember && selectedMember.id === id) {
                setSelectedMember(prev => prev ? ({ ...prev, [field]: value }) : null)
            }
        } else {
            alert(`Error updating ${field}`)
        }
    }

    const filteredMembers = members.filter(member =>
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-semibold mb-2">Member Management</h1>
                    <p className="text-[var(--color-text-muted)]">Activate and manage community members.</p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                    />
                </div>
            </div>

            {/* Members List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-[var(--color-text-muted)]">Loading members...</p>
                ) : filteredMembers.length === 0 ? (
                    <p className="text-[var(--color-text-muted)]">No members found.</p>
                ) : (
                    filteredMembers.map((member) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={member.id}
                            className={`
                                relative overflow-hidden rounded-xl border p-6 transition-all
                                ${member.status === 'active'
                                    ? 'bg-[var(--color-bg-card)] border-[var(--color-border)]'
                                    : 'bg-[var(--color-bg-card)] border-yellow-500/30 opacity-80'
                                }
                            `}
                        >
                            {/* Status Badge */}
                            <div className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider
                                ${member.status === 'active'
                                    ? 'bg-green-500/10 text-green-400'
                                    : 'bg-yellow-500/10 text-yellow-400'
                                }
                            `}>
                                {member.status || 'inactive'}
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                {member.profile_photo_url ? (
                                    <img
                                        src={member.profile_photo_url}
                                        alt={member.full_name || 'Member'}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-border)]"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-[var(--color-bg-darker)] flex items-center justify-center border border-[var(--color-border)]">
                                        <User className="w-6 h-6 text-[var(--color-text-muted)]" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-medium text-lg text-white">
                                        {member.full_name || 'Unnamed Member'}
                                    </h3>
                                    <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate max-w-[150px]">{member.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6 text-sm">
                                {member.location && (
                                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                                        <MapPin className="w-4 h-4" />
                                        <span>{member.location}</span>
                                    </div>
                                )}
                                {member.joining_reason && (
                                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                                        <Briefcase className="w-4 h-4" />
                                        <span className="capitalize">{member.joining_reason}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                                    <Shield className="w-4 h-4" />
                                    <span className="capitalize">{member.billing_plan || 'Free'} Plan</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleStatus(member.id, member.status || 'inactive')}
                                    className={`
                                        flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
                                        ${member.status === 'active'
                                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                        }
                                    `}
                                >
                                    {member.status === 'active' ? (
                                        <>
                                            <UserX className="w-4 h-4" />
                                            Deactivate
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="w-4 h-4" />
                                            Activate
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setSelectedMember(member)}
                                    className="px-3 py-2 rounded-lg bg-[var(--color-bg-darker)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white transition-colors"
                                >
                                    Details
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Member Details Modal */}
            {selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMember(null)}>
                    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-serif font-bold">Member Details</h2>
                            <button onClick={() => setSelectedMember(null)} className="text-[var(--color-text-muted)] hover:text-white">✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-[var(--color-accent-blue)] font-medium mb-4 uppercase text-xs tracking-wider">Personal Info</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-[var(--color-text-muted)]">Full Name</label>
                                        <p className="text-lg">{selectedMember.full_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--color-text-muted)]">Email</label>
                                        <p className="text-base">{selectedMember.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--color-text-muted)]">Phone</label>
                                        <p className="text-base">{selectedMember.mobile_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--color-text-muted)]">Location</label>
                                        <p className="text-base">{selectedMember.location || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[var(--color-accent-blue)] font-medium mb-4 uppercase text-xs tracking-wider">Professional Profile</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-[var(--color-text-muted)]">Intent</label>
                                        <p className="text-base capitalize">{selectedMember.joining_reason || 'N/A'}</p>
                                    </div>
                                    {selectedMember.joining_reason === 'partner' && (
                                        <>
                                            <div>
                                                <label className="text-xs text-[var(--color-text-muted)]">Experience</label>
                                                <p className="text-base">{selectedMember.experience_level || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-[var(--color-text-muted)]">Website</label>
                                                {selectedMember.website_link ? (
                                                    <a href={selectedMember.website_link} target="_blank" className="text-blue-400 hover:underline block break-all">{selectedMember.website_link}</a>
                                                ) : <p>N/A</p>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Membership & Billing Section */}
                        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                            <h3 className="text-[var(--color-accent-blue)] font-medium mb-4 uppercase text-xs tracking-wider">Membership & Billing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-2">Plan Tier</label>
                                    <select
                                        value={selectedMember.billing_plan || 'free'}
                                        onChange={(e) => updateBilling(selectedMember.id, 'billing_plan', e.target.value)}
                                        className="w-full px-3 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent-blue)]"
                                    >
                                        <option value="free">Free</option>
                                        <option value="pro">Pro</option>
                                        <option value="partner">Partner</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-2">Billing Status</label>
                                    <select
                                        value={selectedMember.billing_status || 'active'}
                                        onChange={(e) => updateBilling(selectedMember.id, 'billing_status', e.target.value)}
                                        className="w-full px-3 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent-blue)]"
                                    >
                                        <option value="active">Active</option>
                                        <option value="past_due">Past Due</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Portfolio Images if partner */}
                        {selectedMember.joining_reason === 'partner' && selectedMember.portfolio_images && selectedMember.portfolio_images.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                                <h3 className="text-[var(--color-accent-blue)] font-medium mb-4 uppercase text-xs tracking-wider">Portfolio</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {/* Typescript workaround for array */}
                                    {(selectedMember.portfolio_images as any)?.map((img: string, i: number) => (
                                        <img key={i} src={img} alt="Portfolio" className="w-full h-32 object-cover rounded-lg border border-[var(--color-border)]" />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex justify-between items-center">
                            {selectedMember.joining_reason === 'partner' && selectedMember.consent_to_feature && (
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation()
                                        const newFeatured = !selectedMember.is_featured
                                        const { error } = await supabase
                                            .from('profiles')
                                            .update({ is_featured: newFeatured })
                                            .eq('id', selectedMember.id)

                                        if (!error) {
                                            setSelectedMember({ ...selectedMember, is_featured: newFeatured })
                                            setRefreshTrigger(prev => prev + 1)
                                        }
                                    }}
                                    className={`
                                        px-4 py-2 rounded-lg font-medium transition-colors border
                                        ${selectedMember.is_featured
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
                                            : 'bg-[var(--color-bg-darker)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-white'
                                        }
                                    `}
                                >
                                    {selectedMember.is_featured ? '✨ Featured on Homepage' : 'Feature on Homepage'}
                                </button>
                            )}

                            <button
                                onClick={() => toggleStatus(selectedMember.id, selectedMember.status || 'inactive')}
                                className={`
                                    px-6 py-2 rounded-lg font-medium transition-colors
                                    ${selectedMember.status === 'active'
                                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                    }
                                `}
                            >
                                {selectedMember.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
