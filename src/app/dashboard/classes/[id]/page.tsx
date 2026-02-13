'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { BookOpen, CheckCircle2, Circle, Play, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Lesson = {
    id: string
    title: string
    description: string | null
    duration: number | null
    video_url: string | null
    order_index: number
    is_locked: boolean
}

type ClassData = {
    id: string
    title: string
    description: string
    instructor: string
    image_url: string
}

type Enrollment = {
    id: string
    progress: number
    enrolled_at: string
}

type LessonProgress = {
    lesson_id: string
    is_completed: boolean
}

export default function CoursePlayerPage() {
    const params = useParams()
    const router = useRouter()
    const classId = params.id as string

    const [classData, setClassData] = useState<ClassData | null>(null)
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
    const [progress, setProgress] = useState<LessonProgress[]>([])
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [classId])

    const fetchData = async () => {
        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }
        setUserId(user.id)

        // Fetch class data
        const { data: classInfo } = await supabase
            .from('classes')
            .select('*')
            .eq('id', classId)
            .single()

        if (classInfo) setClassData(classInfo)

        // Fetch lessons
        const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .eq('class_id', classId)
            .order('order_index', { ascending: true })

        if (lessonsData) {
            setLessons(lessonsData)
            if (lessonsData.length > 0) setCurrentLesson(lessonsData[0])
        }

        // Check enrollment
        const { data: enrollmentData } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', user.id)
            .eq('class_id', classId)
            .single()

        setEnrollment(enrollmentData)

        // Fetch progress
        if (enrollmentData) {
            const { data: progressData } = await supabase
                .from('lesson_progress')
                .select('lesson_id, is_completed')
                .eq('user_id', user.id)

            if (progressData) setProgress(progressData)
        }

        setLoading(false)
    }

    const handleEnroll = async () => {
        if (!userId) return

        const { data, error } = await supabase
            .from('enrollments')
            .insert([{ user_id: userId, class_id: classId }])
            .select()
            .single()

        if (error) {
            console.error('Enrollment error:', error)
            alert('Failed to enroll. Please try again.')
        } else {
            setEnrollment(data)
        }
    }

    const markAsComplete = async (lessonId: string) => {
        if (!userId) return

        const { error } = await supabase
            .from('lesson_progress')
            .upsert({
                user_id: userId,
                lesson_id: lessonId,
                is_completed: true,
                completed_at: new Date().toISOString()
            })

        if (!error) {
            setProgress(prev => [...prev.filter(p => p.lesson_id !== lessonId), { lesson_id: lessonId, is_completed: true }])

            // Update enrollment progress
            const completedCount = progress.filter(p => p.is_completed).length + 1
            const totalLessons = lessons.length
            const newProgress = Math.round((completedCount / totalLessons) * 100)

            await supabase
                .from('enrollments')
                .update({ progress: newProgress, last_accessed_at: new Date().toISOString() })
                .eq('user_id', userId)
                .eq('class_id', classId)

            if (enrollment) {
                setEnrollment({ ...enrollment, progress: newProgress })
            }
        }
    }

    const isLessonCompleted = (lessonId: string) => {
        return progress.some(p => p.lesson_id === lessonId && p.is_completed)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    // Not enrolled gate
    if (!enrollment) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{classData?.title}</h2>
                    <p className="text-[var(--color-text-muted)] mb-6">
                        You need to enroll in this course to access the lessons.
                    </p>
                    <button
                        onClick={handleEnroll}
                        className="w-full px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity mb-4"
                    >
                        Enroll Now
                    </button>
                    <Link href="/dashboard" className="text-sm text-[var(--color-text-muted)] hover:text-white">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-dark)] flex flex-col">
            {/* Header */}
            <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-card)]/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <Link href="/dashboard" className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm">Back to Dashboard</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-[var(--color-accent-blue)]" />
                            <span className="text-sm text-[var(--color-text-muted)]">{lessons.length} Lessons</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{classData?.title}</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-[var(--color-accent-blue)] transition-all duration-300"
                                style={{ width: `${enrollment.progress}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium text-[var(--color-accent-blue)]">{enrollment.progress}%</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Lesson Sidebar */}
                <div className="w-80 border-r border-[var(--color-border)] bg-[var(--color-bg-card)]/30 overflow-y-auto">
                    <div className="p-4 space-y-2">
                        {lessons.map((lesson, index) => {
                            const completed = isLessonCompleted(lesson.id)
                            const isCurrent = currentLesson?.id === lesson.id

                            return (
                                <button
                                    key={lesson.id}
                                    onClick={() => setCurrentLesson(lesson)}
                                    className={`w-full text-left p-4 rounded-lg border transition-all ${isCurrent
                                            ? 'bg-[var(--color-accent-blue)]/10 border-[var(--color-accent-blue)]'
                                            : 'bg-[var(--color-bg-darker)] border-[var(--color-border)] hover:border-[var(--color-accent-blue)]/50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {completed ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                            ) : isCurrent ? (
                                                <Play className="w-5 h-5 text-[var(--color-accent-blue)]" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-[var(--color-text-muted)]">
                                                    {index + 1}
                                                </span>
                                                {lesson.duration && (
                                                    <span className="text-xs text-[var(--color-text-muted)]">
                                                        {lesson.duration} min
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={`font-medium text-sm ${isCurrent ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>
                                                {lesson.title}
                                            </h3>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Video Player Area */}
                <div className="flex-1 overflow-y-auto">
                    {currentLesson ? (
                        <div className="max-w-5xl mx-auto p-6">
                            {/* Video */}
                            <div className="bg-black rounded-xl overflow-hidden mb-6 aspect-video">
                                {currentLesson.video_url ? (
                                    currentLesson.video_url.includes('youtube.com') || currentLesson.video_url.includes('youtu.be') ? (
                                        <iframe
                                            className="w-full h-full"
                                            src={currentLesson.video_url.replace('watch?v=', 'embed/')}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video className="w-full h-full" controls>
                                            <source src={currentLesson.video_url} />
                                        </video>
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <div className="text-center">
                                            <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
                                            <p>No video available</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Lesson Info */}
                            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
                                <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                                {currentLesson.description && (
                                    <p className="text-[var(--color-text-muted)] mb-4">{currentLesson.description}</p>
                                )}

                                {!isLessonCompleted(currentLesson.id) && (
                                    <button
                                        onClick={() => markAsComplete(currentLesson.id)}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Mark as Complete
                                    </button>
                                )}
                                {isLessonCompleted(currentLesson.id) && (
                                    <div className="flex items-center gap-2 text-green-400">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-medium">Completed</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">
                            <div className="text-center">
                                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>No lessons available yet</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
