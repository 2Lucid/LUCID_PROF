"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { QuizQuestion } from "@/components/studio/quiz/quiz-question"
import { Plus, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { generateId } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import { SUBJECTS, Subject } from "@/lib/constants/subjects"
import { AIGeneratorModal } from "@/components/studio/ai-generator-modal"

function QuizEditor() {
    const searchParams = useSearchParams()
    const quizId = searchParams.get('id')

    const [title, setTitle] = useState("Untitled Quiz")
    const [selectedSubject, setSelectedSubject] = useState<Subject | "">("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [questions, setQuestions] = useState([
        {
            id: "1",
            questionText: "",
            options: [
                { id: "opt1", text: "", isCorrect: false },
                { id: "opt2", text: "", isCorrect: false }
            ]
        }
    ])
    const [isLoading, setIsLoading] = useState(!!quizId)

    const { user } = useAuth()

    useEffect(() => {
        if (quizId && user) {
            const fetchQuiz = async () => {
                const { data, error } = await supabase
                    .from('quizzes')
                    .select('*')
                    .eq('id', quizId)
                    .single()

                if (error) {
                    console.error('Error fetching quiz:', error)
                    return
                }

                if (data) {
                    setTitle(data.title)
                    setQuestions(data.content || [])
                    setSelectedSubject(data.subject || "")
                    setSelectedCategory(data.category || "")
                }
                setIsLoading(false)
            }
            fetchQuiz()
        }
    }, [quizId, user])

    const addQuestion = () => {
        setQuestions([...questions, {
            id: generateId(),
            questionText: "",
            options: [{ id: generateId(), text: "", isCorrect: false }]
        }])
    }

    const updateQuestion = (id: string, field: string, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
    }

    const deleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    const [isSaving, setIsSaving] = useState(false)

    const saveQuiz = async () => {
        if (!user) {
            alert("You must be logged in to save.")
            return
        }
        setIsSaving(true)
        try {
            const quizData = {
                title,
                created_by: user.id,
                content: questions,
                subject: selectedSubject,
                category: selectedCategory,
                status: 'published'
            }

            let error;

            if (quizId) {
                const { error: updateError } = await supabase
                    .from('quizzes')
                    .update(quizData)
                    .eq('id', quizId)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('quizzes')
                    .insert(quizData)
                error = insertError
            }

            if (error) throw error
            alert(quizId ? "Quiz updated successfully!" : "Quiz saved successfully!")
        } catch (err: any) {
            console.error(err)
            alert(`Error saving quiz: ${err.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/studio" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-transparent text-2xl font-bold text-white focus:outline-none focus:border-b border-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <AIGeneratorModal
                        type="quiz"
                        onGenerate={(data) => {
                            if (data.title) setTitle(data.title)
                            if (data.questions) {
                                const newQuestions = data.questions.map((q: any) => ({
                                    id: generateId(),
                                    questionText: q.questionText,
                                    options: q.options.map((opt: any) => ({
                                        id: generateId(),
                                        text: opt.text,
                                        isCorrect: opt.isCorrect
                                    }))
                                }))
                                setQuestions(newQuestions)
                            }
                        }}
                    />
                    <button
                        onClick={saveQuiz}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Quiz"}
                    </button>
                </div>
            </div>

            {/* Organization Controls */}
            <div className="flex gap-4 mb-8">
                <div className="relative group">
                    <select
                        value={selectedSubject}
                        onChange={(e) => {
                            setSelectedSubject(e.target.value as Subject)
                            setSelectedCategory("")
                        }}
                        className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-gray-300 focus:outline-none focus:border-primary hover:bg-white/10 transition-colors"
                    >
                        <option value="" disabled>Select Subject</option>
                        {Object.keys(SUBJECTS).map((sub) => (
                            <option key={sub} value={sub} className="bg-gray-900">{sub}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

                <div className="relative group">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        disabled={!selectedSubject}
                        className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-gray-300 focus:outline-none focus:border-primary hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="" disabled>Select Category</option>
                        {selectedSubject && SUBJECTS[selectedSubject as Subject]?.map((cat) => (
                            <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div>
                {questions.map((q, index) => (
                    <QuizQuestion
                        key={q.id}
                        id={q.id}
                        index={index}
                        questionText={q.questionText}
                        options={q.options}
                        onUpdate={updateQuestion}
                        onDelete={deleteQuestion}
                    />
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 text-gray-400 font-medium hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Add New Question
                </button>
            </div>
        </div>
    )
}

export default function QuizEditorPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>}>
            <QuizEditor />
        </Suspense>
    )
}
