"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, BookOpen, BrainCircuit, FileText, Dumbbell, Globe, User, Search, Filter, BadgeCheck, Medal } from "lucide-react"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import Link from "next/link"
import { useLanguage } from "@/components/providers/language-provider"
import { supabase } from "@/lib/supabase"
import { SUBJECTS } from "@/lib/constants/subjects"

export default function GlobalPage() {
    const { t } = useLanguage()

    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<any[]>([])
    const [professors, setProfessors] = useState<Record<string, string>>({})
    const [filter, setFilter] = useState<'all' | 'quiz' | 'course' | 'flashcard' | 'exercise'>('all')
    const [subjectFilter, setSubjectFilter] = useState<string>('all')

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch Professors map
                const { data: profs } = await supabase.from('professors').select('id, display_name')
                const profMap: Record<string, string> = {}
                if (profs) {
                    profs.forEach(p => profMap[p.id] = p.display_name)
                }
                setProfessors(profMap)

                // Fetch Validations
                const { data: validations } = await supabase.from('validations').select('content_id, status')
                const validationCounts: Record<string, number> = {}
                if (validations) {
                    validations.forEach(v => {
                        if (v.status === 'approved') {
                            validationCounts[v.content_id] = (validationCounts[v.content_id] || 0) + 1
                        }
                    })
                }

                // Fetch all content types
                const [quizzes, courses, flashcards, exercises] = await Promise.all([
                    supabase.from('quizzes').select('*').eq('status', 'published').order('created_at', { ascending: false }),
                    supabase.from('courses').select('*').eq('status', 'published').order('created_at', { ascending: false }),
                    supabase.from('flashcards').select('*').eq('status', 'published').order('created_at', { ascending: false }),
                    supabase.from('exercises').select('*').eq('status', 'published').order('created_at', { ascending: false })
                ])

                const allItems = [
                    ...(quizzes.data || []).map(i => ({ ...i, type: 'quiz' })),
                    ...(courses.data || []).map(i => ({ ...i, type: 'course' })),
                    ...(flashcards.data || []).map(i => ({ ...i, type: 'flashcard' })),
                    ...(exercises.data || []).map(i => ({ ...i, type: 'exercise' }))
                ].map(item => ({
                    ...item,
                    validationCount: validationCounts[item.id] || 0
                })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

                setItems(allItems)

            } catch (err) {
                console.error("Error fetching global data:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const filteredItems = items.filter(i => {
        const typeMatch = filter === 'all' ? true : i.type === filter
        const subjectMatch = subjectFilter === 'all' ? true : i.subject === subjectFilter
        return typeMatch && subjectMatch
    })

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'quiz': return <BookOpen className="w-4 h-4 text-primary" />
            case 'course': return <FileText className="w-4 h-4 text-accent" />
            case 'flashcard': return <BrainCircuit className="w-4 h-4 text-secondary" />
            case 'exercise': return <Dumbbell className="w-4 h-4 text-emerald-500" />
            default: return <Globe className="w-4 h-4" />
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'quiz': return t('myWork.stats.quizzes')
            case 'course': return t('myWork.stats.courses')
            case 'flashcard': return t('myWork.stats.flashcards')
            case 'exercise': return t('myWork.stats.exercises')
            default: return 'Unknown'
        }
    }

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400">
                    <Globe className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('global.title')}</h1>
                    <p className="text-gray-400 mt-1">{t('global.subtitle')}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <Filter className="w-5 h-5 text-gray-400 mr-2" />
                {['all', 'quiz', 'course', 'flashcard', 'exercise'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === f
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {f === 'all' ? 'All Content' : getTypeLabel(f)}
                    </button>
                ))}
            </div>

            {/* Subject Filters */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <BookOpen className="w-5 h-5 text-gray-400 mr-2" />
                <button
                    onClick={() => setSubjectFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${subjectFilter === 'all'
                        ? 'bg-white text-black'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    All Subjects
                </button>
                {Object.keys(SUBJECTS).map((s) => (
                    <button
                        key={s}
                        onClick={() => setSubjectFilter(s)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${subjectFilter === s
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // Skeletons
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="glass-card h-48 animate-pulse bg-white/5" />
                    ))
                ) : filteredItems.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        No content found.
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <div key={item.id} className="glass-card p-6 hover:translate-y-[-4px] transition-transform duration-300 group relative overflow-hidden">
                            {/* Certification Gradient Background for Certified Courses */}
                            {item.type === 'course' && item.is_certification && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] pointer-events-none" />
                            )}

                            {/* Type Badge & Validations */}
                            <div className="flex items-center justify-between mb-4">
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs font-medium border border-white/5 ${item.type === 'quiz' ? 'text-primary' :
                                    item.type === 'course' ? 'text-accent' :
                                        item.type === 'flashcard' ? 'text-secondary' : 'text-emerald-500'
                                    }`}>
                                    {getTypeIcon(item.type)}
                                    <span className="capitalize">{item.type}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Certified Badge */}
                                    {item.type === 'course' && item.is_certification && (
                                        <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full text-[10px] font-bold border border-yellow-500/20" title="Certification Course">
                                            <Medal className="w-3 h-3" />
                                            <span>CERTIFIED</span>
                                        </div>
                                    )}

                                    {/* Validated Badge */}
                                    {item.validationCount > 0 && (
                                        <div className="flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded-full text-[10px] font-bold border border-green-500/20" title={`${item.validationCount} Validations`}>
                                            <BadgeCheck className="w-3 h-3" />
                                            <span>{item.validationCount}</span>
                                        </div>
                                    )}

                                    {/* Verified Badge */}
                                    {item.verification_status === 'verified' && (
                                        <VerifiedBadge size="sm" />
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>

                            {/* Subject & Date */}
                            <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                                {item.subject && <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400">{item.subject}</span>}
                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] text-white font-bold">
                                    <User className="w-3 h-3" />
                                </div>
                                <p className="text-sm text-gray-400">
                                    {t('global.createdBy')} <span className="text-gray-200">{professors[item.created_by] || 'Unknown Prof'}</span>
                                </p>
                            </div>

                            {/* Action */}
                            <Link href={`/view/${item.type}/${item.id}`} className="w-full py-2 rounded-lg bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2">
                                {t('global.view')} <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Link>
                        </div>
                    ))
                )
                }
            </div >
        </div >
    )
}
