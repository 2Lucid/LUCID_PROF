"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { BookOpen, BrainCircuit, FileText, Dumbbell } from "lucide-react"
import { FlashcardValidation } from "@/components/dashboard/flashcard-validation"
import { CourseValidation } from "@/components/dashboard/course-validation"
import { QuizValidation } from "@/components/dashboard/quiz-validation"
import { ExerciseValidation } from "@/components/dashboard/exercise-validation"
import { useLanguage } from "@/components/providers/language-provider"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"

type ContentCategory = "all" | "quiz" | "flashcard" | "course" | "exercise"

interface ValidationItem {
    id: string
    type: string
    content: any
    metadata: string
    submittedBy: string
    category: ContentCategory
    created_at: string
}

export default function ValidationPage() {
    const { t } = useLanguage()
    const { user } = useAuth()
    const [selectedCategory, setSelectedCategory] = useState<ContentCategory>("all")
    const [items, setItems] = useState<ValidationItem[]>([])
    const [history, setHistory] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    // Use user.id directly
    const userId = user?.id

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return;
        }

        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch professors for name mapping
                const { data: professors } = await supabase.from('professors').select('id, display_name')
                const profMap = new Map(professors?.map(p => [p.id, p.display_name]) || [])

                // Fetch user subjects
                const { data: userData } = await supabase
                    .from('professors')
                    .select('subject, additional_subjects')
                    .eq('id', userId)
                    .single()

                const userSubjects: string[] = [] // Subject filter disabled

                const tables = ['quizzes', 'courses', 'flashcards', 'exercises']
                let allItems: ValidationItem[] = []
                let totalCount = 0

                // Get already validated IDs first to exclude them from count
                const { data: validated } = await supabase
                    .from('validations')
                    .select('content_id')
                    .eq('validator_id', userId)

                const validatedIds = new Set(validated?.map((v: any) => v.content_id))

                // Parallel Fetching strategy
                const promises = tables.map(async (table) => {
                    // 1. Fetch Count (Total Pending)
                    let countQuery = supabase
                        .from(table)
                        .select('id', { count: 'exact', head: true }) // optimized count query
                        .eq('is_public', true)
                        .neq('created_by', userId)

                    // Subject filter removed - all users see all public content

                    const { count } = await countQuery

                    // Note: This count is "total in table", we can't easily filter out "validatedIds" in SQL without a join or NOT IN list which can be large. 
                    // For V1 performance, we might just accept the count includes validated ones, OR do a slightly more complex query afterwards.
                    // Let's stick to simple first:
                    totalCount += (count || 0)

                    // 2. Fetch Data (Limit 5 per table)
                    let dataQuery = supabase
                        .from(table)
                        .select('*')
                        .eq('is_public', true)
                        .neq('created_by', userId)
                        .limit(5) // SAFETY LIMIT
                        .order('created_at', { ascending: false })

                    // Subject filter removed - all users see all public content

                    const { data } = await dataQuery
                    return { table, data: data || [] }
                })

                const results = await Promise.all(promises)

                results.forEach(({ table, data }) => {
                    const mappedItems = data.map((item: any) => {
                        if (validatedIds.has(item.id)) return null // Skip already validated in the fetch results

                        let type = "Unknown"
                        let category: ContentCategory = "quiz"

                        if (table === 'quizzes') { type = "Quiz Question"; category = "quiz" }
                        else if (table === 'courses') { type = "Course Lesson"; category = "course" }
                        else if (table === 'flashcards') { type = "Flashcard"; category = "flashcard" }
                        else if (table === 'exercises') { type = "Exercise"; category = "exercise" }

                        const profName = profMap.get(item.created_by) || "Unknown Prof"

                        return {
                            id: item.id,
                            type,
                            content: item.content,
                            metadata: `Submitted by ${profName} • ${item.subject || 'General'}`,
                            submittedBy: profName,
                            category,
                            created_at: item.created_at
                        }
                    }).filter(Boolean) as ValidationItem[] // Filter nulls

                    allItems = [...allItems, ...mappedItems]
                })

                // Adjust total count calculation - (Real Count - Validated Count) is hard without exact overlap.
                // For now, let's use the local loaded items as a proxy for "pending right now"
                // Or better, keep `totalCount` as an "Items available to check" metric (roughly)

                // Sort and Limit Global Stack to 5
                allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

                // Show only 5 max to user
                setItems(allItems.slice(0, 5))

            } catch (error) {
                console.error("Error fetching validation items:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [userId])

    const handleValidation = async (id: string, approved: boolean) => {
        if (!userId) return

        const item = items.find(i => i.id === id)
        if (!item) return

        // Optimistic update
        setItems((prev) => prev.filter((i) => i.id !== id))
        setHistory((prev) => [...prev, id])

        try {
            await supabase.from('validations').insert({
                content_id: id,
                content_type: item.category, // simplified mapping
                validator_id: userId,
                status: approved ? 'approved' : 'rejected'
            })
            console.log(`Item ${id} ${approved ? 'approved' : 'rejected'}`)

            if (approved) {
                // Check if threshold reached
                const { count } = await supabase
                    .from('validations')
                    .select('*', { count: 'exact', head: true })
                    .eq('content_id', id)
                    .eq('status', 'approved')

                if (count && count >= 3) {
                    // Get correct table name
                    const tableMap: Record<string, string> = {
                        'quiz': 'quizzes',
                        'course': 'courses',
                        'flashcard': 'flashcards',
                        'exercise': 'exercises'
                    }
                    const tableName = tableMap[item.category]

                    if (tableName) {
                        await supabase
                            .from(tableName)
                            .update({ verification_status: 'verified' })
                            .eq('id', id)
                        console.log(`Content ${id} promoted to Verified!`)
                    }
                }
            }

        } catch (error) {
            console.error("Error saving validation:", error)
        }
    }

    const filteredItems = selectedCategory === "all"
        ? items
        : items.filter(item => item.category === selectedCategory)

    const categories = [
        { id: "all", name: t('validation.filters.all'), icon: null, count: items.length },
        { id: "quiz", name: t('validation.filters.quiz'), icon: BookOpen, count: items.filter(i => i.category === "quiz").length },
        { id: "flashcard", name: t('validation.filters.flashcard'), icon: BrainCircuit, count: items.filter(i => i.category === "flashcard").length },
        { id: "course", name: t('validation.filters.course'), icon: FileText, count: items.filter(i => i.category === "course").length },
        { id: "exercise", name: t('validation.filters.exercise'), icon: Dumbbell, count: items.filter(i => i.category === "exercise").length },
    ]



    const getCategoryButtonClasses = (catId: string) => {
        const isActive = selectedCategory === catId

        if (!isActive) {
            return 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
        }

        switch (catId) {
            case 'quiz':
                return 'bg-primary/20 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)] border border-primary/30'
            case 'flashcard':
                return 'bg-secondary/20 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] border border-secondary/30'
            case 'course':
                return 'bg-accent/20 text-white shadow-[0_0_12px_rgba(192,132,252,0.3)] border border-accent/30'
            case 'exercise':
                return 'bg-emerald-500/20 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] border border-emerald-500/30'
            default:
                return 'bg-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)] border border-white/30'
        }
    }

    const currentItem = filteredItems.length > 0 ? filteredItems[filteredItems.length - 1] : null

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh] text-white">Loading content...</div>
    }

    return (
        <div className="min-h-[calc(100vh-140px)] flex flex-col max-w-6xl mx-auto py-6">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white">{t('validation.title')}</h1>
                <p className="text-gray-400">{t('validation.subtitle')}</p>
            </div>

            {/* Stats Header */}
            <div className="grid grid-cols-3 gap-4 text-center mb-8">
                <div className="glass-card p-4">
                    <div className="text-2xl font-bold text-green-500">{history.length}</div>
                    <div className="text-xs text-gray-500 mt-1">{t('validation.stats.reviewed')}</div>
                </div>
                <div className="glass-card p-4">
                    <div className="text-2xl font-bold text-primary">{items.length}</div>
                    <div className="text-xs text-gray-500 mt-1">{t('validation.stats.pending')}</div>
                </div>
                <div className="glass-card p-4">
                    <div className="text-2xl font-bold text-secondary">{items.length > 0 ? new Set(items.map(i => i.category)).size : 0}</div>
                    <div className="text-xs text-gray-500 mt-1">{t('validation.stats.types')}</div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {categories.map((cat) => {
                    const Icon = cat.icon
                    const isActive = selectedCategory === cat.id

                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id as ContentCategory)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${getCategoryButtonClasses(cat.id)}`}
                        >
                            {Icon && <Icon className="w-4 h-4" />}
                            <span>{cat.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-white/10'
                                }`}>
                                {cat.count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Validation Area */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-2xl h-[550px]">
                    <AnimatePresence mode="wait">
                        {currentItem ? (
                            <div key={currentItem.id} className="h-full">
                                {currentItem.category === 'flashcard' && (
                                    <FlashcardValidation item={currentItem} onValidate={(approved) => handleValidation(currentItem.id, approved)} />
                                )}
                                {currentItem.category === 'course' && (
                                    <CourseValidation item={currentItem} onValidate={(approved) => handleValidation(currentItem.id, approved)} />
                                )}
                                {currentItem.category === 'quiz' && (
                                    <QuizValidation item={currentItem} onValidate={(approved) => handleValidation(currentItem.id, approved)} />
                                )}
                                {currentItem.category === 'exercise' && (
                                    <ExerciseValidation item={currentItem} onValidate={(approved) => handleValidation(currentItem.id, approved)} />
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-center p-12 glass rounded-2xl">
                                <div>
                                    <h3 className="text-xl font-bold text-white">🎉 Tout est validé !</h3>
                                    <p className="text-gray-400 mt-2">
                                        Plus de contenu à valider pour le moment.
                                    </p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
