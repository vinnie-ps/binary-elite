'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Award, ExternalLink, Twitter, Linkedin, Github, Facebook, Instagram, Youtube, Music } from 'lucide-react'
import Image from 'next/image'

type FeaturedMember = {
    id: string
    profile_id: string
    gallery_bio: string | null
    role_in_community: string | null
    contributions: string[] | null
    profile_image_url: string | null
    social_links: any
    display_order: number
    profiles: {
        full_name: string
        email: string
        portfolio_images: string[] | null
    }
}

export default function MemberGallery() {
    const [members, setMembers] = useState<FeaturedMember[]>([])
    const [selectedMember, setSelectedMember] = useState<FeaturedMember | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMembers()
    }, [])

    const fetchMembers = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('featured_members')
            .select(`
                *,
                profiles!inner(full_name, email, portfolio_images)
            `)
            .eq('is_featured', true)
            .order('display_order', { ascending: true })

        if (data) setMembers(data as any)
        setLoading(false)
    }

    if (loading) return null
    if (members.length === 0) return null

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--color-bg-dark)] to-[var(--color-bg-darker)]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-400">Community Champions</span>
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                        Elite <span className="text-gradient">Tech Minds</span>
                    </h2>
                    <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                        Celebrating the individuals who drive innovation and growth in our community
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            onClick={() => setSelectedMember(member)}
                            className="group relative bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer overflow-hidden"
                        >
                            {/* Portfolio Preview (Glassy background if no images) */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-30 group-hover:opacity-50 transition-opacity" />

                            {/* Portfolio Images (Like the old partners section) */}
                            {member.profiles?.portfolio_images && member.profiles.portfolio_images.length > 0 && (
                                <div className="absolute top-0 left-0 w-full h-32 overflow-hidden opacity-40 group-hover:opacity-60 transition-opacity">
                                    <img
                                        src={member.profiles.portfolio_images[0]}
                                        alt="Portfolio Preview"
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-bg-card)]" />
                                </div>
                            )}

                            <div className="relative z-10 pt-12">
                                {/* Avatar */}
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-1 mb-4 mx-auto">
                                    <div className="w-full h-full rounded-full bg-[var(--color-bg-darker)] flex items-center justify-center overflow-hidden">
                                        {member.profile_image_url ? (
                                            <Image
                                                src={member.profile_image_url}
                                                alt={member.profiles?.full_name || 'Member'}
                                                width={96}
                                                height={96}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <User className="w-12 h-12 text-gray-600" />
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="text-center">
                                    <h3 className="font-bold text-xl mb-1">{member.profiles?.full_name || 'Binary Elite Member'}</h3>
                                    {member.role_in_community && (
                                        <p className="text-sm text-purple-400 mb-3">{member.role_in_community}</p>
                                    )}
                                    {member.gallery_bio && (
                                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-3 mb-4">
                                            {member.gallery_bio}
                                        </p>
                                    )}
                                    <button className="text-sm text-[var(--color-accent-blue)] group-hover:underline flex items-center gap-1 mx-auto">
                                        View Profile
                                        <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {selectedMember && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedMember(null)}
                >
                    <div
                        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8">
                            {/* Avatar */}
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-1 mb-6 mx-auto">
                                <div className="w-full h-full rounded-full bg-[var(--color-bg-darker)] flex items-center justify-center overflow-hidden">
                                    {selectedMember.profile_image_url ? (
                                        <Image
                                            src={selectedMember.profile_image_url}
                                            alt={selectedMember.profiles?.full_name || 'Member'}
                                            width={128}
                                            height={128}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <User className="w-16 h-16 text-gray-600" />
                                    )}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold mb-2">{selectedMember.profiles?.full_name || 'Binary Elite Member'}</h2>
                                {selectedMember.role_in_community && (
                                    <p className="text-lg text-purple-400 mb-4">{selectedMember.role_in_community}</p>
                                )}
                                {selectedMember.gallery_bio && (
                                    <p className="text-[var(--color-text-muted)]">{selectedMember.gallery_bio}</p>
                                )}
                            </div>

                            {/* Contributions */}
                            {selectedMember.contributions && selectedMember.contributions.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-bold text-lg mb-3">Contributions</h3>
                                    <ul className="space-y-2">
                                        {selectedMember.contributions.map((contribution, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-[var(--color-accent-blue)] mt-1">•</span>
                                                <span className="text-[var(--color-text-muted)]">{contribution}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Social Links */}
                            {selectedMember.social_links && (
                                <div className="flex justify-center gap-4 flex-wrap">
                                    {Object.entries(selectedMember.social_links).map(([platform, url]) => {
                                        if (!url) return null;

                                        const getIcon = () => {
                                            switch (platform) {
                                                case 'twitter': return <Twitter className="w-4 h-4" />;
                                                case 'linkedin': return <Linkedin className="w-4 h-4" />;
                                                case 'github': return <Github className="w-4 h-4" />;
                                                case 'facebook': return <Facebook className="w-4 h-4" />;
                                                case 'instagram': return <Instagram className="w-4 h-4" />;
                                                case 'youtube': return <Youtube className="w-4 h-4" />;
                                                case 'tiktok': return <Music className="w-4 h-4" />;
                                                default: return <ExternalLink className="w-4 h-4" />;
                                            }
                                        };

                                        return (
                                            <a
                                                key={platform}
                                                href={url as string}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-darker)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent-blue)] transition-colors capitalize text-sm"
                                                title={platform}
                                            >
                                                {getIcon()}
                                                {platform}
                                            </a>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                onClick={() => setSelectedMember(null)}
                                className="mt-6 w-full px-4 py-2 bg-[var(--color-bg-darker)] rounded-lg hover:bg-[var(--color-accent-blue)] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
