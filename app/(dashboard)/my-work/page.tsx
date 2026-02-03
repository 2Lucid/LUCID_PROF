"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { ArrowLeft, BookOpen, BrainCircuit, FileText, Dumbbell, Eye, Edit, Trash2, Loader2, Layers } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/providers/language-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

import { SUBJECTS } from "@/lib/constants/subjects"

export default function MyWorkPage() {
    const { t } = useLanguage()
    const { user } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ quizzes: 0, courses: 0, flashcards: 0, exercises: 0, collections: 0 })
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [flashcards, setFlashcards] = useState<any[]>([])
    const [exercises, setExercises] = useState<any[]>([])
    const [collections, setCollections] = useState<any[]>([])
    const [selectedSubject, setSelectedSubject] = useState("")

    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }

        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch Quizzes
                const { data: quizData } = await supabase
                    .from('quizzes')
                    .select('*')
                    .eq('created_by', user.id)
                    .order('created_at', { ascending: false })

                // Fetch Courses
                const { data: courseData } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('created_by', user.id)
                    .order('created_at', { ascending: false })

                // Fetch Flashcards
                const { data: flashcardData } = await supabase
                    .from('flashcards')
                    .select('*')
                    .eq('created_by', user.id)
                    .order('created_at', { ascending: false })

                // Fetch Exercises
                const { data: exerciseData } = await supabase
                    .from('exercises')
                    .select('*')
                    .eq('created_by', user.id)
                    .order('created_at', { ascending: false })

                // Fetch Collections
                const { data: collectionData } = await supabase
                    .from('collections')
                    .select('*')
                    .eq('created_by', user.id)
                    .order('created_at', { ascending: false })


                const qData = quizData || []
                const cData = courseData || []
                const fData = flashcardData || []
                const eData = exerciseData || []
                const colData = collectionData || []

                setQuizzes(qData)
                setCourses(cData)
                setFlashcards(fData)
                setExercises(eData)
                setCollections(colData)

                setStats({
                    quizzes: qData.length,
                    courses: cData.length,
                    flashcards: fData.length,
                    exercises: eData.length,
                    collections: colData.length
                })

            } catch (err) {
                console.error("Unexpected error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    const handleDelete = async (type: 'quizzes' | 'courses' | 'flashcards' | 'exercises' | 'collections', id: string) => {
        if (!confirm(t('common.confirmDelete') || "Are you sure you want to delete this item?")) return

        try {
            const { error } = await supabase
                .from(type)
                .delete()
                .eq('id', id)

            if (error) throw error

            // Update local state
            if (type === 'quizzes') setQuizzes(quizzes.filter(q => q.id !== id))
            if (type === 'courses') setCourses(courses.filter(c => c.id !== id))
            if (type === 'flashcards') setFlashcards(flashcards.filter(f => f.id !== id))
            if (type === 'exercises') setExercises(exercises.filter(e => e.id !== id))
            if (type === 'collections') setCollections(collections.filter(c => c.id !== id))

            setStats(prev => ({ ...prev, [type]: prev[type] - 1 }))

        } catch (err) {
            console.error("Error deleting item:", err)
            alert("Failed to delete item")
        }
    }

    // Filter logic
    const filteredCourses = selectedSubject
        ? courses.filter(c => c.subject === selectedSubject)
        : courses

    const filteredExercises = selectedSubject
        ? exercises.filter(e => e.content?.config?.topic?.toLowerCase().includes(selectedSubject.toLowerCase()))
        : exercises

    // Simple filter for collections based on subject if available
    const filteredCollections = selectedSubject
        ? collections.filter(c => c.subject === selectedSubject)
        : collections

    const filteredQuizzes = selectedSubject ? [] : quizzes
    const filteredFlashcards = selectedSubject ? [] : flashcards


    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
                <p className="text-gray-400 mb-6">Please log in to view your work.</p>
                <Link href="/login" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                    Log In
                </Link>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{t('myWork.title')}</h1>
                        <p className="text-gray-400 mt-1">{t('myWork.subtitle')}</p>
                    </div>
                </div>

                {/* Subject Filter */}
                <div className="relative">
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:border-accent hover:bg-white/10 transition-colors min-w-[200px]"
                    >
                        <option value="" className="bg-gray-900">All Subjects</option>
                        {Object.keys(SUBJECTS).map((sub) => (
                            <option key={sub} value={sub} className="bg-gray-900">{sub}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="glass-card p-4 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{stats.quizzes}</div>
                    <div className="text-sm text-gray-400">{t('myWork.stats.quizzes')}</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-3xl font-bold text-secondary mb-1">{stats.flashcards}</div>
                    <div className="text-sm text-gray-400">{t('myWork.stats.flashcards')}</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-3xl font-bold text-accent mb-1">{stats.courses}</div>
                    <div className="text-sm text-gray-400">{t('myWork.stats.courses')}</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-500 mb-1">{stats.exercises}</div>
                    <div className="text-sm text-gray-400">{t('myWork.stats.exercises')}</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-3xl font-bold text-purple-500 mb-1">{stats.collections}</div>
                    <div className="text-sm text-gray-400">Collections</div>
                </div>
            </div>

            {/* Collections */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-500" />
                        Collections ({filteredCollections.length})
                    </h2>
                    <Link href="/studio/collection" className="text-sm text-purple-500 hover:text-purple-400">Create Collection</Link>
                </div>
                {filteredCollections.length === 0 ? (
                    <div className="text-center p-8 border border-white/5 rounded-xl bg-white/5">
                        <p className="text-gray-400">No collections found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredCollections.map(col => (
                            <div key={col.id} className="glass-card p-5 flex items-center justify-between hover:bg-white/10 transition-colors border-l-4 border-purple-500">
                                <div>
                                    <h3 className="font-bold text-white mb-1">{col.title}</h3>
                                    <div className="flex gap-4 text-sm text-gray-400">
                                        {col.subject && <span className="text-purple-400">{col.subject}</span>}
                                        {col.subject && <span>•</span>}
                                        <span>{new Date(col.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/view/collection/${col.id}`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <Link href={`/studio/collection?id=${col.id}`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete('collections', col.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Quizzes */}
            {(selectedSubject && filteredQuizzes.length === 0) ? null : (
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            {t('myWork.stats.quizzes')} ({(selectedSubject ? filteredQuizzes : quizzes).length})
                        </h2>
                        <Link href="/studio/quiz" className="text-sm text-primary hover:text-primary/80">{t('myWork.actions.newQuiz')}</Link>
                    </div>

                    {(selectedSubject ? filteredQuizzes : quizzes).length === 0 ? (
                        <div className="text-center p-8 border border-white/5 rounded-xl bg-white/5">
                            <p className="text-gray-400">No quizzes found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(selectedSubject ? filteredQuizzes : quizzes).map(quiz => (
                                <div key={quiz.id} className="glass-card p-5 flex items-center justify-between hover:bg-white/10 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-white mb-1">{quiz.title}</h3>
                                        <div className="flex gap-4 text-sm text-gray-400">
                                            <span>{Array.isArray(quiz.content) ? quiz.content.length : 0} questions</span>
                                            <span>•</span>
                                            <span className={`capitalize ${quiz.status === 'published' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {quiz.status || 'draft'}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/view/quiz/${quiz.id}`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link href={`/studio/quiz?id=${quiz.id}`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete('quizzes', quiz.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Courses */}
            {(selectedSubject && filteredCourses.length === 0) ? null : (
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-accent" />
                            {t('myWork.stats.courses')} ({(selectedSubject ? filteredCourses : courses).length})
                        </h2>
                        <Link href="/studio/course" className="text-sm text-accent hover:text-accent/80">{t('myWork.actions.newCourse')}</Link>
                    </div>

                    {(selectedSubject ? filteredCourses : courses).length === 0 ? (
                        <div className="text-center p-8 border border-white/5 rounded-xl bg-white/5">
                            <p className="text-gray-400">No courses found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(selectedSubject ? filteredCourses : courses).map(course => (
                                <div key={course.id} className="glass-card p-5 border-l-4 border-accent flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-white mb-2">{course.title}</h3>
                                        <div className="flex gap-4 text-sm text-gray-400">
                                            <span>{Array.isArray(course.content) ? course.content.length : 0} blocks</span>
                                            <span>•</span>
                                            {course.subject && <span className="text-accent">{course.subject}</span>}
                                            <span>•</span>
                                            <span className={`capitalize ${course.status === 'published' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {course.status || 'draft'}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(course.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/view/course/${course.id}`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link href={`/studio/course?id=${course.id}`} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete('courses', course.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Flashcards */}
            {(selectedSubject && filteredFlashcards.length === 0) ? null : (
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-secondary" />
                            {t('myWork.stats.flashcards')} ({(selectedSubject ? filteredFlashcards : flashcards).length})
                        </h2>
                        <Link href="/studio/flashcards" className="text-sm text-secondary hover:text-secondary/80">{t('myWork.actions.newDeck')}</Link>
                    </div>
                    {(selectedSubject ? filteredFlashcards : flashcards).length === 0 ? (
                        <div className="text-center p-8 border border-white/5 rounded-xl bg-white/5">
                            <p className="text-gray-400">No flashcards found.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {(selectedSubject ? filteredFlashcards : flashcards).map(deck => (
                                <div key={deck.id} className="glass-card p-5">
                                    <h3 className="font-bold text-white mb-2">{deck.title}</h3>
                                    <div className="flex gap-4 text-sm text-gray-400 mb-4">
                                        <span>{Array.isArray(deck.content) ? deck.content.length : 0} cards</span>
                                        <span>•</span>
                                        <span>{new Date(deck.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/view/flashcards/${deck.id}`} className="flex-1 py-2 rounded-lg bg-secondary/10 text-secondary text-center text-sm font-medium hover:bg-secondary hover:text-white transition-colors">
                                            {t('myWork.actions.view')}
                                        </Link>
                                        <Link href={`/studio/flashcards?id=${deck.id}`} className="flex-1 py-2 rounded-lg bg-secondary/20 text-secondary text-center text-sm font-medium hover:bg-secondary hover:text-white transition-colors">
                                            {t('myWork.actions.edit')}
                                        </Link>
                                        <button
                                            onClick={() => handleDelete('flashcards', deck.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Exercises */}
            {(selectedSubject && filteredExercises.length === 0) ? null : (
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Dumbbell className="w-5 h-5 text-emerald-500" />
                            {t('myWork.stats.exercises')} ({(selectedSubject ? filteredExercises : exercises).length})
                        </h2>
                        <Link href="/studio/exercises" className="text-sm text-emerald-500 hover:text-emerald-400">{t('myWork.actions.newSet')}</Link>
                    </div>
                    {(selectedSubject ? filteredExercises : exercises).length === 0 ? (
                        <div className="text-center p-8 border border-white/5 rounded-xl bg-white/5">
                            <p className="text-gray-400">No exercises found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(selectedSubject ? filteredExercises : exercises).map(set => (
                                <div key={set.id} className="glass-card p-5 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-white mb-1">{set.title}</h3>
                                        <div className="flex gap-4 text-sm text-gray-400">
                                            <span>{set.content?.exercises?.length || 0} exercises</span>
                                            <span>•</span>
                                            <span>{new Date(set.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/view/exercises/${set.id}`} className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500 hover:text-white transition-colors">
                                            {t('myWork.actions.view')}
                                        </Link>
                                        <button
                                            onClick={() => handleDelete('exercises', set.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    )
}
