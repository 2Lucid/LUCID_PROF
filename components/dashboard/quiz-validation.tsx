"use client"

import { Check, X, BookOpen, CheckCircle2, Circle } from "lucide-react"

interface QuizValidationProps {
    item: any
    onValidate: (approved: boolean) => void
}

export function QuizValidation({ item, onValidate }: QuizValidationProps) {
    // Handle both: direct array OR nested content.questions
    const questions = Array.isArray(item.content)
        ? item.content
        : (item.content?.questions || [])

    return (
        <div className="h-full glass-card rounded-2xl p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/20">
                    <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Quiz Question</h3>
                    <p className="text-xs text-gray-500">{item.metadata}</p>
                </div>
            </div>

            {/* Questions */}
            <div className="bg-white/5 rounded-xl p-6 mb-4 flex-1 overflow-y-auto">
                <p className="text-lg font-bold text-white mb-4">
                    {item.content?.title || "Quiz"} ({questions.length} questions)
                </p>

                <div className="space-y-6">
                    {questions.length > 0 ? questions.map((q: any, qIdx: number) => (
                        <div key={qIdx} className="border-b border-white/10 pb-4 last:border-0">
                            <p className="text-white font-medium mb-3">
                                {qIdx + 1}. {q.questionText || q.question || "No question text"}
                            </p>
                            <div className="space-y-2 ml-4">
                                {(q.options || []).map((option: any, oIdx: number) => (
                                    <div
                                        key={oIdx}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${option.isCorrect
                                            ? 'bg-green-500/10 border border-green-500/30'
                                            : 'bg-white/5'
                                            }`}
                                    >
                                        {option.isCorrect ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-gray-600" />
                                        )}
                                        <span className={option.isCorrect ? 'text-green-300 font-medium' : 'text-gray-300'}>
                                            {option.text}
                                        </span>
                                        {option.isCorrect && (
                                            <span className="ml-auto text-xs text-green-500 font-bold">✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-500 italic">No questions available</p>
                    )}
                </div>
            </div>


            {/* Action Buttons */}
            <div className="flex gap-4 mt-auto">
                <button
                    onClick={() => onValidate(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all"
                >
                    <X className="w-5 h-5" />
                    Reject
                </button>
                <button
                    onClick={() => onValidate(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500/20 text-green-400 font-bold hover:bg-green-500 hover:text-white transition-all"
                >
                    <Check className="w-5 h-5" />
                    Approve
                </button>
            </div>
        </div>
    )
}
