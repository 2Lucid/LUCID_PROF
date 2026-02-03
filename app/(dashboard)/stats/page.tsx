"use client"

import { useEffect, useState } from "react"
import { BarChart2, PieChart as PieChartIcon, TrendingUp } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export default function StatsPage() {
    const { t } = useLanguage()
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)

    const [stats, setStats] = useState({
        quizzes: 0,
        courses: 0,
        flashcards: 0,
        exercises: 0
    })

    const [distributionData, setDistributionData] = useState<any[]>([])
    const [subjectData, setSubjectData] = useState<any[]>([])

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const [quizzes, courses, flashcards, exercises] = await Promise.all([
                    supabase.from('quizzes').select('*').eq('created_by', user.id),
                    supabase.from('courses').select('subject').eq('created_by', user.id),
                    supabase.from('flashcards').select('*').eq('created_by', user.id),
                    supabase.from('exercises').select('*').eq('created_by', user.id)
                ])

                const qCount = quizzes.data?.length || 0
                const cCount = courses.data?.length || 0
                const fCount = flashcards.data?.length || 0
                const eCount = exercises.data?.length || 0

                setStats({
                    quizzes: qCount,
                    courses: cCount,
                    flashcards: fCount,
                    exercises: eCount
                })

                // Prepare Pie Chart Data
                setDistributionData([
                    { name: 'Quizzes', value: qCount, color: '#8b5cf6' }, // Primary
                    { name: 'Courses', value: cCount, color: '#f472b6' }, // Accent
                    { name: 'Flashcards', value: fCount, color: '#fbbf24' }, // Secondary
                    { name: 'Exercises', value: eCount, color: '#10b981' }  // Emerald
                ].filter(d => d.value > 0))

                // Prepare Bar Chart Data (Courses by Subject)
                const subjectCounts: Record<string, number> = {}
                courses.data?.forEach((c: any) => {
                    const sub = c.subject || 'Uncategorized'
                    subjectCounts[sub] = (subjectCounts[sub] || 0) + 1
                })

                setSubjectData(Object.entries(subjectCounts).map(([name, value]) => ({ name, value })))

            } catch (err) {
                console.error("Error fetching stats:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-cyan-400">
                    <BarChart2 className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('stats.title')}</h1>
                    <p className="text-gray-400 mt-1">{t('stats.subtitle')}</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Reusing cards styling but simpler */}
                <div className="glass-card p-5 border-l-4 border-l-primary">
                    <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Quizzes</div>
                    <div className="text-3xl font-bold text-white">{stats.quizzes}</div>
                </div>
                <div className="glass-card p-5 border-l-4 border-l-accent">
                    <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Courses</div>
                    <div className="text-3xl font-bold text-white">{stats.courses}</div>
                </div>
                <div className="glass-card p-5 border-l-4 border-l-secondary">
                    <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Decks</div>
                    <div className="text-3xl font-bold text-white">{stats.flashcards}</div>
                </div>
                <div className="glass-card p-5 border-l-4 border-l-emerald-500">
                    <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Exercises</div>
                    <div className="text-3xl font-bold text-white">{stats.exercises}</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Distribution Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-gray-400" />
                        {t('stats.distribution')}
                    </h3>
                    <div className="h-[300px] w-full">
                        {distributionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No data to display
                            </div>
                        )}
                    </div>
                </div>

                {/* Subject Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                        {t('stats.coursesBySubject')}
                    </h3>
                    <div className="h-[300px] w-full">
                        {subjectData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={subjectData}>
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    />
                                    <Bar dataKey="value" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No courses categorized yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
