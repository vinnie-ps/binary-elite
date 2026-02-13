export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            projects: {
                Row: {
                    id: string
                    title: string
                    description: string
                    icon: string
                    status: 'live' | 'mvp' | 'in_progress'
                    features: string[]
                    order_index: number
                    is_active: boolean
                    link: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    icon: string
                    status: 'live' | 'mvp' | 'in_progress'
                    features: string[]
                    order_index?: number
                    is_active?: boolean
                    link?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    icon?: string
                    status?: 'live' | 'mvp' | 'in_progress'
                    features?: string[]
                    order_index?: number
                    is_active?: boolean
                    link?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            feature_cards: {
                Row: {
                    id: string
                    title: string
                    description: string
                    icon: string
                    order_index: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    icon: string
                    order_index?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    icon?: string
                    order_index?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            site_settings: {
                Row: {
                    id: string
                    setting_key: string
                    setting_value: string
                    setting_type: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    setting_key: string
                    setting_value: string
                    setting_type?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    setting_key?: string
                    setting_value?: string
                    setting_type?: string
                    updated_at?: string
                }
            }
            applications: {
                Row: {
                    id: string
                    name: string
                    email: string
                    message: string
                    status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
                    submitted_at: string
                    reviewed_at: string | null
                    notes: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    email: string
                    message: string
                    status?: 'pending' | 'reviewed' | 'accepted' | 'rejected'
                    submitted_at?: string
                    reviewed_at?: string | null
                    notes?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    message?: string
                    status?: 'pending' | 'reviewed' | 'accepted' | 'rejected'
                    submitted_at?: string
                    reviewed_at?: string | null
                    notes?: string | null
                }
            }
            posts: {
                Row: {
                    id: string
                    title: string
                    content: string
                    image_url: string | null
                    is_published: boolean
                    author_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    image_url?: string | null
                    is_published?: boolean
                    author_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    image_url?: string | null
                    is_published?: boolean
                    author_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            resources: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    url: string
                    type: 'pdf' | 'video' | 'link' | 'other'
                    category: string | null
                    is_member_only: boolean
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    url: string
                    type: 'pdf' | 'video' | 'link' | 'other'
                    category?: string | null
                    is_member_only?: boolean
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    url?: string
                    type?: 'pdf' | 'video' | 'link' | 'other'
                    category?: string | null
                    is_member_only?: boolean
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            lessons: {
                Row: {
                    id: string
                    class_id: string
                    title: string
                    description: string | null
                    duration: number | null
                    video_url: string | null
                    is_locked: boolean
                    order_index: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    class_id: string
                    title: string
                    description?: string | null
                    duration?: number | null
                    video_url?: string | null
                    is_locked?: boolean
                    order_index?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    class_id?: string
                    title?: string
                    description?: string | null
                    duration?: number | null
                    video_url?: string | null
                    is_locked?: boolean
                    order_index?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            enrollments: {
                Row: {
                    id: string
                    user_id: string
                    class_id: string
                    progress: number
                    enrolled_at: string
                    last_accessed_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    class_id: string
                    progress?: number
                    enrolled_at?: string
                    last_accessed_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    class_id?: string
                    progress?: number
                    enrolled_at?: string
                    last_accessed_at?: string
                }
            }
            lesson_progress: {
                Row: {
                    id: string
                    user_id: string
                    lesson_id: string
                    is_completed: boolean
                    completed_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    lesson_id: string
                    is_completed?: boolean
                    completed_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    lesson_id?: string
                    is_completed?: boolean
                    completed_at?: string | null
                }
            }
            featured_members: {
                Row: {
                    id: string
                    profile_id: string
                    gallery_bio: string | null
                    role_in_community: string | null
                    contributions: string[] | null
                    profile_image_url: string | null
                    social_links: any | null
                    is_featured: boolean
                    display_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    gallery_bio?: string | null
                    role_in_community?: string | null
                    contributions?: string[] | null
                    profile_image_url?: string | null
                    social_links?: any | null
                    is_featured?: boolean
                    display_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    gallery_bio?: string | null
                    role_in_community?: string | null
                    contributions?: string[] | null
                    profile_image_url?: string | null
                    social_links?: any | null
                    is_featured?: boolean
                    display_order?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            public_announcements: {
                Row: {
                    id: string
                    title: string
                    content: string
                    category: string
                    image_url: string | null
                    is_published: boolean
                    publish_date: string
                    author_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    category?: string
                    image_url?: string | null
                    is_published?: boolean
                    publish_date?: string
                    author_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    category?: string
                    image_url?: string | null
                    is_published?: boolean
                    publish_date?: string
                    author_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            project_status: 'live' | 'mvp' | 'in_progress'
            application_status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
        }
    }
}
