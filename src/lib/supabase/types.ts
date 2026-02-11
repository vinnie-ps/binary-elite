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
