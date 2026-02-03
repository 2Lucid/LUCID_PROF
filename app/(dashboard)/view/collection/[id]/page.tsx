"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Layers, BookOpen, FileText, BrainCircuit, Dumbbell, PlayCircle, Lock } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

const Icons = {
    quiz: BookOpen,
    course: FileText,
    flashcards: BrainCircuit,
    exercises: Dumbbell
}

export default function CollectionViewPage() {
    const params = useParams()
    const id = params.id as string

    const [collection, setCollection] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCollection = async () => {
            // 1. Fetch Collection
            const { data: col, error: colError } = await supabase
                .from('collections')
                .select('*')
                .eq('id', id)
                .single()

            if (colError) {
                console.error('Error fetching collection:', colError)
                setLoading(false)
                return
            }

            setCollection(col)

            // 2. Fetch Items
            const { data: colItems, error: itemsError } = await supabase
                .from('collection_items')
                .select('*')
                .eq('collection_id', id)
                .order('position', { ascending: true })

            // 3. Populate Items (Client join)
            const populatedItems = await Promise.all((colItems || []).map(async (item: any) => {
                let tableName = item.content_type === 'quiz' ? 'quizzes' :
                    item.content_type === 'course' ? 'courses' :
                        item.content_type === 'flashcards' ? 'flashcards' : 'exercises'

                const { data: contentData } = await supabase
                    .from(tableName)
                    .select('title, subject')
                    .eq('id', item.content_id)
                    .single()

                return {
                    ...item,
                    title: contentData?.title || "Unknown Item",
                    subject: contentData?.subject
                }
            }))

            setItems(populatedItems)
            setLoading(false)
        }

        if (id) fetchCollection()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    if (!collection) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">Collection not found</h2>
                <Link href="/global" className="text-emerald-500 hover:underline">Return to Feed</Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-12">
                <Link href="/global" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <div className="flex items-start gap-6">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
                        <Layers className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 text-sm text-emerald-500 font-medium mb-2 uppercase tracking-wider">
                            <span>Collection</span>
                            {collection.subject && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                    <span>{collection.subject}</span>
                                </>
                            )}
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">{collection.title}</h1>
                        {collection.description && (
                            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">{collection.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Path / Timeline */}
            <div className="relative">
                {/* Connector Line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-white/10" />

                <div className="space-y-8">
                    {items.map((item, index) => {
                        const Icon = Icons[item.content_type as keyof typeof Icons] || FileText
                        return (
                            <Link
                                key={item.id}
                                href={`/view/${item.content_type}/${item.content_id}`}
                                className="relative flex gap-6 group"
                            >
                                {/* Indicator */}
                                <div className="relative z-10 flex-shrink-0 w-16 h-16 flex items-center justify-center bg-black border-2 border-white/10 rounded-full group-hover:border-emerald-500 group-hover:scale-110 transition-all duration-300">
                                    <span className="text-xl font-bold text-gray-500 group-hover:text-emerald-500 transition-colors">
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Card */}
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-black/20 rounded-lg text-gray-400 group-hover:text-emerald-400 transition-colors">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-200 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                                    {item.content_type}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                            <PlayCircle className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
