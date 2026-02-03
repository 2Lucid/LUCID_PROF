"use client"

import { useState } from "react"
import { Trash2, Plus, CheckCircle2, Circle } from "lucide-react"
import { generateId } from "@/lib/utils"

interface Option {
    id: string
    text: string
    isCorrect: boolean
}

interface QuestionProps {
    id: string
    index: number
    questionText: string
    options: Option[]
    onUpdate: (id: string, field: string, value: any) => void
    onDelete: (id: string) => void
}

export function QuizQuestion({ id, index, questionText, options, onUpdate, onDelete }: QuestionProps) {
    const handleOptionChange = (optionId: string, text: string) => {
        const newOptions = options.map(opt => opt.id === optionId ? { ...opt, text } : opt)
        onUpdate(id, "options", newOptions)
    }

    const handleCorrectSelect = (optionId: string) => {
        const newOptions = options.map(opt => ({ ...opt, isCorrect: opt.id === optionId }))
        onUpdate(id, "options", newOptions)
    }

    const addOption = () => {
        const newOption = { id: generateId(), text: "", isCorrect: false }
        onUpdate(id, "options", [...options, newOption])
    }

    const deleteOption = (optionId: string) => {
        onUpdate(id, "options", options.filter(opt => opt.id !== optionId))
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-400">Question {index + 1}</h3>
                <button onClick={() => onDelete(id)} className="text-red-400 hover:text-red-300 p-1">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <input
                type="text"
                value={questionText}
                onChange={(e) => onUpdate(id, "questionText", e.target.value)}
                placeholder="Enter your question here..."
                className="w-full bg-transparent text-xl font-bold text-white placeholder:text-gray-600 border-b border-white/10 focus:border-primary focus:outline-none pb-2 mb-6"
            />

            <div className="space-y-3">
                {options.map((option) => (
                    <div key={option.id} className="flex items-center gap-3 group">
                        <button
                            onClick={() => handleCorrectSelect(option.id)}
                            className={`flex-shrink-0 transition-colors ${option.isCorrect ? 'text-green-500' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            {option.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>

                        <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(option.id, e.target.value)}
                            placeholder="Option text..."
                            className={`flex-1 bg-white/5 rounded-lg px-4 py-2 text-sm text-gray-200 border border-transparent focus:border-primary/50 focus:outline-none ${option.isCorrect ? 'bg-green-500/10 border-green-500/20' : ''}`}
                        />

                        <button onClick={() => deleteOption(option.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addOption}
                className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
                <Plus className="w-4 h-4" /> Add Option
            </button>
        </div>
    )
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" /><path d="m6 6 18 18" />
        </svg>
    )
}
