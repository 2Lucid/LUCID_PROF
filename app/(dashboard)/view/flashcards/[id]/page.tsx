"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, BrainCircuit, GitFork, Loader2 } from "lucide-react"
import Link from "next/link"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import { useRemix } from "@/hooks/use-remix"
import { useAuth } from "@/components/providers/auth-provider"

export default function FlashcardsViewPage() {
    const params = useParams()
    const id = params.id as string
    const { user } = useAuth()
    const { remixContent, isRemixing } = useRemix()

    const [deck, setDeck] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDeck = async () => {
            const { data, error } = await supabase
                .from('flashcards')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching deck:', error)
            } else {
                setDeck(data)
            }
            setLoading(false)
        }

        if (id) fetchDeck()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
            </div>
        )
    }

    if (!deck) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">Deck not found</h2>
                <Link href="/my-work" className="text-secondary hover:underline">Return to My Work</Link>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/global" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-secondary mb-1">
                            <BrainCircuit className="w-5 h-5" />
                            <span className="text-sm font-medium uppercase tracking-wider">Flashcard Deck Preview</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold text-white">{deck.title}</h1>
                            {deck.verification_status === 'verified' && <VerifiedBadge />}
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

                    {user && user.id !== deck.created_by && (
                        <button
                            onClick={() => remixContent(deck, 'flashcards')}
                            disabled={isRemixing}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50"
                        >
                            {isRemixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitFork className="w-4 h-4" />}
                            Remix
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deck.content && Array.isArray(deck.content) && deck.content.map((card: any) => (
                    <div key={card.id} className="glass-card p-6 flex flex-col gap-4">
                        <div className="pb-4 border-b border-white/5">
                            <span className="text-xs font-bold text-gray-500 uppercase">Front</span>
                            <p className="text-white font-medium mt-1">{card.front}</p>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Back</span>
                            <p className="text-gray-300 mt-1">{card.back}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
