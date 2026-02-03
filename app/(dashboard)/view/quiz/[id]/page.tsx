"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, BookOpen, CheckCircle2, Circle, GitFork, Loader2 } from "lucide-react"
import Link from "next/link"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import { useRemix } from "@/hooks/use-remix"
import { useAuth } from "@/components/providers/auth-provider"

export default function QuizViewPage() {
    const params = useParams()
    const id = params.id as string
    const { user } = useAuth()
    const { remixContent, isRemixing } = useRemix()

    const [quiz, setQuiz] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [printMode, setPrintMode] = useState<'student' | 'teacher'>('teacher')

    useEffect(() => {
        const fetchQuiz = async () => {
            const { data, error } = await supabase
                .from('quizzes')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching quiz:', error)
            } else {
                setQuiz(data)
            }
            setLoading(false)
        }

        if (id) fetchQuiz()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">Quiz not found</h2>
                <Link href="/my-work" className="text-primary hover:underline">Return to My Work</Link>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto pb-20 print:max-w-none print:pb-0">
            <div className="flex items-center justify-between gap-4 mb-8 print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/global" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <BookOpen className="w-5 h-5" />
                            <span className="text-sm font-medium uppercase tracking-wider">Quiz Preview</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold text-white">{quiz.title}</h1>
                            {quiz.verification_status === 'verified' && <VerifiedBadge />}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setPrintMode('student')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${printMode === 'student' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Student
                        </button>
                        <button
                            onClick={() => setPrintMode('teacher')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${printMode === 'teacher' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Teacher
                        </button>
                    </div>
                    {/* Print Button Component */}
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" /></svg>
                        <span className="hidden sm:inline">Print</span>
                    </button>

                    {user && user.id !== quiz.created_by && (
                        <button
                            onClick={() => remixContent(quiz, 'quiz')}
                            disabled={isRemixing}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isRemixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitFork className="w-4 h-4" />}
                            Remix
                        </button>
                    )}
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-black">{quiz.title}</h1>
                <p className="text-gray-500 mt-1">{printMode === 'student' ? 'Student Interface' : 'Teacher Answer Key'}</p>
            </div>

            <div className="space-y-6">
                {quiz.content && Array.isArray(quiz.content) && quiz.content.map((q: any, index: number) => (
                    <div key={q.id || index} className="bg-white/5 border border-white/10 rounded-xl p-6 print:border print:border-gray-200 print:bg-white print:text-black print-break-avoid print:shadow-none">
                        <div className="flex gap-4">
                            <span className="text-lg font-bold text-primary/50 print:text-black/50">{(index + 1).toString().padStart(2, '0')}</span>
                            <div className="flex-1">
                                <h3 className="text-xl font-medium text-white mb-4 print:text-black">{q.questionText}</h3>
                                <div className="space-y-3">
                                    {q.options && q.options.map((opt: any) => (
                                        <div
                                            key={opt.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border 
                                            ${printMode === 'teacher'
                                                    ? (opt.isCorrect
                                                        ? 'bg-green-500/10 border-green-500/30 print:bg-green-100 print:border-green-300'
                                                        : 'bg-white/5 border-transparent print:border-gray-200')
                                                    : 'bg-white/5 border-transparent print:border-gray-200'
                                                }
                                            `}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                 ${printMode === 'teacher' && opt.isCorrect ? 'border-green-500 text-green-500' : 'border-gray-400 text-transparent'}
                                            `}>
                                                {printMode === 'teacher' && opt.isCorrect && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}
                                            </div>

                                            <span className={`
                                                ${printMode === 'teacher' && opt.isCorrect ? 'text-green-100 print:text-green-900 font-bold' : 'text-gray-300 print:text-black'}
                                            `}>
                                                {opt.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
