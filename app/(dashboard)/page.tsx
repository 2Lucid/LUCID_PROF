"use client"

import { Users, BookOpen, CheckCircle, TrendingUp, ArrowRight, PenTool, Loader2 } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import Link from "next/link"
import { useLanguage } from "@/components/providers/language-provider"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"

export default function HomeDashboard() {
    const { t } = useLanguage()
    const { user } = useAuth()

    const [stats, setStats] = useState({
        studentsImpacted: 12450, // Placeholder
        contentCreated: 0,
        pendingValidations: 0,
        globalRating: 4.9 // Placeholder
    })
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return

            try {
                // 1. Fetch Content Created Count (Quizzes + Courses + Flashcards + Exercises)
                const [quizzes, courses, flashcards, exercises] = await Promise.all([
                    supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
                    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
                    supabase.from('flashcards').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
                    supabase.from('exercises').select('*', { count: 'exact', head: true }).eq('created_by', user.id)
                ])

                const totalContent = (quizzes.count || 0) + (courses.count || 0) + (flashcards.count || 0) + (exercises.count || 0)

                // 2. Fetch Pending Validations (Items waiting for review globally OR items user submitted?)
                // Let's assume "Pending Validations" means "Items I can validate" (Global pending)
                const { count: pendingCount } = await supabase
                    .from('validations')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending')

                setStats(prev => ({
                    ...prev,
                    contentCreated: totalContent,
                    pendingValidations: pendingCount || 0
                }))

                // 3. Fetch Recent Activity (Latest 5 items from user)
                // Since we can't easily union different tables, let's fetch top 3 from each and sort in memory
                const [recentQuizzes, recentCourses] = await Promise.all([
                    supabase.from('quizzes').select('id, title, created_at').eq('created_by', user.id).order('created_at', { ascending: false }).limit(3),
                    supabase.from('courses').select('id, title, created_at').eq('created_by', user.id).order('created_at', { ascending: false }).limit(3)
                ])

                const activities = [
                    ...(recentQuizzes.data || []).map(q => ({ ...q, type: 'quiz' })),
                    ...(recentCourses.data || []).map(c => ({ ...c, type: 'course' }))
                ]

                // Sort by date desc
                activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

                setRecentActivity(activities.slice(0, 4))

            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [user])

    return (
        <div className="space-y-8">
            {/* Title Section */}
            <div>
                <h1 className="text-3xl font-bold text-white">{t('dashboard.welcome')} {user?.display_name || 'Professor'}</h1>
                <p className="text-gray-400 mt-1">{t('dashboard.impactDescription')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={t('dashboard.stats.studentsImpacted')}
                    value={stats.studentsImpacted.toLocaleString()}
                    trend="+12%"
                    icon={Users}
                    color="primary"
                />
                <StatCard
                    title={t('dashboard.stats.contentCreated')}
                    value={loading ? '-' : stats.contentCreated.toString()}
                    trend={loading ? undefined : "+4"}
                    icon={BookOpen}
                    color="secondary"
                />
                <StatCard
                    title={t('dashboard.stats.pendingValidations')}
                    value={loading ? '-' : stats.pendingValidations.toString()}
                    icon={CheckCircle}
                    color="warning"
                />
                <StatCard
                    title={t('dashboard.stats.globalRating')}
                    value={stats.globalRating.toString()}
                    icon={TrendingUp}
                    color="success"
                />
            </div>

            {/* Main Content Split */}
            <div className="grid gap-8 lg:grid-cols-3">

                {/* Quick Actions (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold text-white">{t('dashboard.quickActions.title')}</h2>
                    <div className="grid gap-4 sm:grid-cols-2">

                        <Link href="/studio/quiz" className="group relative overflow-hidden rounded-2xl glass p-6 transition-all hover:bg-white/10 hover:border-primary/50">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <PenTool className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <PenTool className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white">{t('dashboard.quickActions.createQuiz')}</h3>
                                <p className="text-sm text-gray-400 mt-2 mb-4">{t('dashboard.quickActions.createQuizDesc')}</p>
                                <span className="flex items-center text-sm font-medium text-primary group-hover:text-white transition-colors">
                                    {t('dashboard.quickActions.startCreating')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </Link>

                        <Link href="/validation" className="group relative overflow-hidden rounded-2xl glass p-6 transition-all hover:bg-white/10 hover:border-secondary/50">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CheckCircle className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white">{t('dashboard.quickActions.validateContent')}</h3>
                                <p className="text-sm text-gray-400 mt-2 mb-4">{t('dashboard.quickActions.validateContentDesc')}</p>
                                <span className="flex items-center text-sm font-medium text-secondary group-hover:text-white transition-colors">
                                    {t('dashboard.quickActions.startReviewing')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity (1/3 width) */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6">{t('dashboard.recentActivity.title')}</h2>
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                            </div>
                        ) : recentActivity.length > 0 ? (
                            recentActivity.map((item, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.type === 'quiz' ? 'bg-primary' : 'bg-accent'}`} />
                                    <div>
                                        <p className="text-sm text-gray-300">
                                            {item.type === 'quiz' ? 'Quiz' : 'Course'} <span className="text-white font-medium">"{item.title}"</span> created.
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {Math.floor((new Date().getTime() - new Date(item.created_at).getTime()) / (1000 * 60 * 60))} hours ago
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
