"use client"

import { Check, X, Dumbbell } from "lucide-react"

interface ExerciseValidationProps {
    item: any
    onValidate: (approved: boolean) => void
}

export function ExerciseValidation({ item, onValidate }: ExerciseValidationProps) {
    return (
        <div className="h-full glass-card rounded-2xl p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Dumbbell className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Exercise Problem</h3>
                    <p className="text-xs text-gray-500">{item.metadata}</p>
                </div>
            </div>

            {/* Problem Statement */}
            <div className="bg-white/5 rounded-xl p-6 mb-4 flex-1 overflow-y-auto">
                <h4 className="text-sm font-bold text-gray-400 mb-3">Problem:</h4>
                <p className="text-xl font-bold text-white mb-6">
                    {item.content?.title || item.content?.problem || "Exercise Problem"}
                </p>

                {item.content?.description && (
                    <p className="text-gray-300 mb-4">{item.content.description}</p>
                )}

                {item.content?.solution && (
                    <>
                        <h4 className="text-sm font-bold text-gray-400 mb-3">Expected Solution:</h4>
                        <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                            <p className="text-gray-200 font-mono">{item.content.solution}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Difficulty Indicator */}
            <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 mb-6">
                <span className="text-sm text-gray-400">Difficulty:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.content?.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                        item.content?.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                            'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    {item.content?.difficulty || 'Medium'}
                </span>
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
