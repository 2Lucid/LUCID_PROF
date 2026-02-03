"use client"

import { useState, Suspense } from "react"
import { Plus, Save, ArrowLeft, BrainCircuit } from "lucide-react"
import Link from "next/link"
import { generateId } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import { useSearchParams } from "next/navigation"
import { SUBJECTS, Subject } from "@/lib/constants/subjects"
import { AIGeneratorModal } from "@/components/studio/ai-generator-modal"

function FlashcardEditor() {
    const searchParams = useSearchParams()
    const deckId = searchParams.get('id')

    const [title, setTitle] = useState("Untitled Deck")
    const [selectedSubject, setSelectedSubject] = useState<Subject | "">("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [cards, setCards] = useState([
        { id: "1", front: "Concept / Term", back: "Definition / Explanation" },
        { id: "2", front: "", back: "" }
    ])

    const addCard = () => {
        setCards([...cards, { id: generateId(), front: "", back: "" }])
    }

    const updateCard = (id: string, field: "front" | "back", value: string) => {
        setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c))
    }

    const deleteCard = (id: string) => {
        setCards(cards.filter(c => c.id !== id))
    }

    const [isSaving, setIsSaving] = useState(false)
    const { user } = useAuth()

    const handleSave = async () => {
        if (!user) {
            alert("You must be logged in to save.")
            return
        }
        setIsSaving(true)
        try {
            const { error } = await supabase.from('flashcards').insert({
                title,
                created_by: user.id,
                content: cards,
                subject: selectedSubject,
                category: selectedCategory,
                status: 'published',
                is_public: true
            })

            if (error) throw error
            alert("Deck saved successfully!")
        } catch (err: any) {
            console.error(err)
            alert(`Error saving deck: ${err.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    const handleAIGenerated = (data: any) => {
        if (data.title) setTitle(data.title)

        if (data.cards && Array.isArray(data.cards)) {
            const newCards = data.cards.map((c: any) => ({
                id: generateId(),
                front: c.front,
                back: c.back
            }))

            // Append or Replace? Let's Append for now, or replace if empty
            if (cards.length === 2 && cards[0].front === "Concept / Term" && cards[1].front === "") {
                setCards(newCards)
            } else {
                setCards([...cards, ...newCards])
            }
        }
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/studio" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent text-3xl font-bold text-white focus:outline-none focus:border-b border-secondary/50 placeholder:text-gray-700"
                        />
                        <p className="text-gray-400 flex items-center gap-2 mt-1">
                            <BrainCircuit className="w-4 h-4" /> {cards.length} cards
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <AIGeneratorModal
                        type="flashcards"
                        onGenerate={handleAIGenerated}
                    />
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-medium hover:bg-secondary hover:text-black transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Deck"}
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
                        className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-gray-300 focus:outline-none focus:border-secondary hover:bg-white/10 transition-colors"
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
                        className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-gray-300 focus:outline-none focus:border-secondary hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {cards.map((card, index) => (
                    <div key={card.id} className="group relative">
                        <div className="absolute -left-3 -top-3 w-8 h-8 flex items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold text-sm border border-secondary/50 z-10">
                            {index + 1}
                        </div>
                        <div className="glass-card p-0 overflow-hidden border-l-4 border-l-secondary/50">
                            {/* Front */}
                            <div className="p-4 border-b border-white/5">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Front</span>
                                <textarea
                                    value={card.front}
                                    onChange={(e) => updateCard(card.id, 'front', e.target.value)}
                                    className="w-full bg-transparent text-lg font-medium text-white placeholder:text-gray-600 focus:outline-none resize-none"
                                    rows={2}
                                    placeholder="Enter term or question..."
                                />
                            </div>
                            {/* Back */}
                            <div className="p-4 bg-white/[0.02]">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Back</span>
                                <textarea
                                    value={card.back}
                                    onChange={(e) => updateCard(card.id, 'back', e.target.value)}
                                    className="w-full bg-transparent text-base text-gray-300 placeholder:text-gray-600 focus:outline-none resize-none"
                                    rows={3}
                                    placeholder="Enter definition or answer..."
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => deleteCard(card.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
                            title="Delete Card"
                        >
                            <Plus className="w-4 h-4 rotate-45" />
                        </button>
                    </div>
                ))}

                {/* Add Card Button */}
                <button
                    onClick={addCard}
                    className="h-full min-h-[250px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-secondary/50 hover:text-secondary hover:bg-secondary/5 transition-all gap-3"
                >
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-secondary/20 transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-medium">Add New Card</span>
                </button>
            </div>
        </div>
    )
}

export default function FlashcardPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        </div>}>
            <FlashcardEditor />
        </Suspense>
    )
}
