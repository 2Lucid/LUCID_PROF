"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface AIGeneratorModalProps {
    type: 'quiz' | 'course' | 'flashcards'
    onGenerate: (data: any) => void
    trigger?: React.ReactNode
}

export function AIGeneratorModal({ type, onGenerate, trigger }: AIGeneratorModalProps) {
    const [open, setOpen] = useState(false)
    const [prompt, setPrompt] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [cardCount, setCardCount] = useState(10)

    const handleGenerate = async () => {
        if (!prompt.trim()) return

        setLoading(true)
        setError("")

        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    type,
                    ...(type === 'flashcards' && { count: cardCount })
                })
            })

            if (response.status === 429) {
                throw new Error("⚠️ Trop de demandes (Quota). Attendez une minute.")
            }
            if (!response.ok) throw new Error("Generation failed")

            const data = await response.json()
            onGenerate(data)
            setOpen(false)
            setPrompt("")
        } catch (err) {
            console.error(err)
            setError("Failed to generate content. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const getTitle = () => {
        switch (type) {
            case 'quiz': return 'Quiz'
            case 'course': return 'Course'
            case 'flashcards': return 'Flashcards'
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                        <Sparkles className="w-4 h-4" />
                        Generate with AI
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Generate {getTitle()} with AI
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-400">
                            Describe the topic and level (e.g., "Advanced Calculus for College Students", "History of Rome for Kids").
                        </p>
                        <Textarea
                            placeholder="Enter your topic..."
                            className="bg-white/5 border-white/10 text-white min-h-[100px]"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>
                    {type === 'flashcards' && (
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Number of cards to generate</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="5"
                                    max="30"
                                    value={cardCount}
                                    onChange={(e) => setCardCount(Number(e.target.value))}
                                    className="flex-1 accent-purple-500"
                                />
                                <span className="text-lg font-bold text-purple-400 w-8 text-center">{cardCount}</span>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-sm text-red-400">{error}</p>}
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
