"use client"

import { useState } from "react"
import { Repeat, Trash2, Image as ImageIcon } from "lucide-react"

interface FlashcardProps {
    id: string
    front: string
    back: string
    onUpdate: (id: string, field: "front" | "back", value: string) => void
    onDelete: (id: string) => void
}

export function FlashcardEditor({ id, front, back, onUpdate, onDelete }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false)

    return (
        <div className="relative h-64 w-full perspective-1000 group">
            <div
                className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#2e1d40] to-[#1a0f2e] border border-white/10 p-6 flex flex-col items-center justify-center shadow-lg relative">
                        <span className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Front</span>

                        <textarea
                            value={front}
                            onChange={(e) => onUpdate(id, "front", e.target.value)}
                            placeholder="Term or Question"
                            className="w-full h-full bg-transparent text-center text-xl text-white placeholder:text-gray-600 focus:outline-none resize-none pt-6"
                        />

                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <button
                                onClick={() => setIsFlipped(true)}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-secondary transition-colors"
                                title="Flip to Back"
                            >
                                <Repeat className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(id)}
                                className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#1a0f2e] to-[#0f0718] border border-secondary/20 p-6 flex flex-col items-center justify-center shadow-lg relative">
                        <span className="absolute top-4 left-4 text-xs font-bold text-secondary uppercase tracking-widest">Back</span>

                        <textarea
                            value={back}
                            onChange={(e) => onUpdate(id, "back", e.target.value)}
                            placeholder="Definition or Answer"
                            className="w-full h-full bg-transparent text-center text-lg text-gray-200 placeholder:text-gray-600 focus:outline-none resize-none pt-6"
                        />

                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <button
                                onClick={() => setIsFlipped(false)}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-secondary transition-colors"
                                title="Flip to Front"
                            >
                                <Repeat className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(id)}
                                className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
