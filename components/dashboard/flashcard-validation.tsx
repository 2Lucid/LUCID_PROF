"use client"

import { useState } from "react"
import { Check, X, BrainCircuit, ChevronLeft, ChevronRight } from "lucide-react"

interface FlashcardValidationProps {
    item: any
    onValidate: (approved: boolean) => void
}

export function FlashcardValidation({ item, onValidate }: FlashcardValidationProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)

    // Handle both: direct array OR nested structure
    const cards = Array.isArray(item.content) ? item.content : []
    const currentCard = cards[currentIndex] || {}
    const totalCards = cards.length

    const nextCard = () => {
        if (currentIndex < totalCards - 1) {
            setCurrentIndex(currentIndex + 1)
            setIsFlipped(false)
        }
    }

    const prevCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
            setIsFlipped(false)
        }
    }

    return (
        <div className="h-full glass-card rounded-2xl p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-secondary/20">
                    <BrainCircuit className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Flashcards</h3>
                    <p className="text-xs text-gray-500">{item.metadata}</p>
                </div>
                <span className="text-sm text-gray-400">{currentIndex + 1} / {totalCards}</span>
            </div>

            {/* Card Preview */}
            <div
                className="flex-1 bg-white/5 rounded-xl p-6 cursor-pointer flex flex-col"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-secondary uppercase">
                        {isFlipped ? "Réponse" : "Question"}
                    </span>
                    <span className="text-xs text-gray-500">Cliquez pour retourner</span>
                </div>

                <div className="flex-1 flex items-center justify-center">
                    <p className={`text-center ${isFlipped ? 'text-lg text-gray-200' : 'text-xl font-bold text-white'}`}>
                        {isFlipped
                            ? (currentCard.back || currentCard.answer || "Pas de réponse")
                            : (currentCard.front || currentCard.question || "Pas de question")
                        }
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 gap-2">
                <button
                    onClick={prevCard}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-1">
                    {cards.slice(0, 10).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setCurrentIndex(idx); setIsFlipped(false); }}
                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-secondary' : 'bg-white/20'}`}
                        />
                    ))}
                    {cards.length > 10 && <span className="text-xs text-gray-500 ml-1">...</span>}
                </div>

                <button
                    onClick={nextCard}
                    disabled={currentIndex === totalCards - 1}
                    className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-4">
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
