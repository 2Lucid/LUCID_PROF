"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Dumbbell, Sparkles, GitFork, Loader2 } from "lucide-react"
import Link from "next/link"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import { useRemix } from "@/hooks/use-remix"
import { useAuth } from "@/components/providers/auth-provider"

export default function ExercisesViewPage() {
    const params = useParams()
    const id = params.id as string
    const { user } = useAuth()
    const { remixContent, isRemixing } = useRemix()

    const [exerciseSet, setExerciseSet] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchExercises = async () => {
            const { data, error } = await supabase
                .from('exercises')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching exercises:', error)
            } else {
                setExerciseSet(data)
            }
            setLoading(false)
        }

        if (id) fetchExercises()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    if (!exerciseSet) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">Exercise Set not found</h2>
                <Link href="/my-work" className="text-emerald-500 hover:underline">Return to My Work</Link>
            </div>
        )
    }

    const { content } = exerciseSet
    const exercises = content?.exercises || []

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/global" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-emerald-500 mb-1">
                            <Dumbbell className="w-5 h-5" />
                            <span className="text-sm font-medium uppercase tracking-wider">Exercise Set Preview</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold text-white">{exerciseSet.title}</h1>
                            {exerciseSet.verification_status === 'verified' && <VerifiedBadge />}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" /></svg>
                        <span className="hidden sm:inline">Print</span>
                    </button>

                    {user && user.id !== exerciseSet.created_by && (
                        <button
                            onClick={() => remixContent(exerciseSet, 'exercises')}
                            disabled={isRemixing}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                            {isRemixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitFork className="w-4 h-4" />}
                            Remix
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {exercises.map((exercise: any, idx: number) => (
                    <div key={exercise.id || idx} className="glass-card p-6 border-l-4 border-emerald-500/50">
                        <div className="flex items-start justify-between mb-3">
                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                                Exercise {idx + 1}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${exercise.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                exercise.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                }`}>
                                {exercise.difficulty}
                            </span>
                        </div>

                        <h4 className="text-white font-medium mb-4 text-lg">{exercise.question}</h4>

                        {Array.isArray(exercise.answer) ? (
                            <div className="space-y-2">
                                {exercise.answer.map((opt: string, i: number) => (
                                    <div
                                        key={i}
                                        className={`px-4 py-3 rounded-lg text-sm ${opt === exercise.correctAnswer
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : 'bg-white/5 text-gray-400'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{opt}</span>
                                            {opt === exercise.correctAnswer && (
                                                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">Correct</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Answer</h5>
                                <p className="text-sm text-gray-300 bg-white/5 rounded-lg p-4">{exercise.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
