"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus, Save, ArrowLeft, GripVertical, Trash2, Library, BookOpen, BrainCircuit, FileText, Dumbbell } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import { SUBJECTS, Subject } from "@/lib/constants/subjects"
import { generateId } from "@/lib/utils"
// Will implement ResourcePicker later
import { ResourcePicker } from "@/components/studio/collections/resource-picker"

// Placeholder icons map
const Icons = {
    quiz: BookOpen,
    course: FileText,
    flashcards: BrainCircuit,
    exercises: Dumbbell
}

function CollectionEditor() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const collectionId = searchParams.get('id')
    const { user } = useAuth()

    const [title, setTitle] = useState("Untitled Collection")
    const [description, setDescription] = useState("")
    const [selectedSubject, setSelectedSubject] = useState<Subject | "">("")
    const [items, setItems] = useState<any[]>([]) // Local state for items
    const [isLoading, setIsLoading] = useState(!!collectionId)
    const [isSaving, setIsSaving] = useState(false)
    const [isPickerOpen, setIsPickerOpen] = useState(false)

    // Fetch existing
    useEffect(() => {
        if (collectionId && user) {
            const fetchCollection = async () => {
                // Fetch Collection
                const { data: col, error: colError } = await supabase
                    .from('collections')
                    .select('*')
                    .eq('id', collectionId)
                    .single()

                if (colError) {
                    console.error('Error fetching collection:', colError)
                    return
                }

                // Fetch Items
                const { data: colItems, error: itemsError } = await supabase
                    .from('collection_items')
                    .select('*')
                    .eq('collection_id', collectionId)
                    .order('position', { ascending: true })

                // We need to fetch the actual content details (title) for display
                // For V1, we might just fetch the content details individually or join if possible.
                // Client-side join for simplicity:
                const populatedItems = await Promise.all((colItems || []).map(async (item: any) => {
                    let tableName = item.content_type === 'quiz' ? 'quizzes' :
                        item.content_type === 'course' ? 'courses' :
                            item.content_type === 'flashcards' ? 'flashcards' : 'exercises'

                    const { data: contentData } = await supabase
                        .from(tableName)
                        .select('title')
                        .eq('id', item.content_id)
                        .single()

                    return {
                        ...item,
                        title: contentData?.title || "Unknown Item"
                    }
                }))

                if (col) {
                    setTitle(col.title)
                    setDescription(col.description || "")
                    setSelectedSubject(col.subject || "")
                    setItems(populatedItems)
                }
                setIsLoading(false)
            }
            fetchCollection()
        }
    }, [collectionId, user])

    const handleSave = async () => {
        if (!user) return
        setIsSaving(true)

        try {
            // 1. Upsert Collection
            const collectionData = {
                title,
                description,
                subject: selectedSubject,
                created_by: user.id,
                is_public: true // Default public for now or add toggle
            }

            let savedId = collectionId

            if (collectionId) {
                const { error } = await supabase
                    .from('collections')
                    .update(collectionData)
                    .eq('id', collectionId)
                if (error) throw error
            } else {
                const { data, error } = await supabase
                    .from('collections')
                    .insert(collectionData)
                    .select()
                    .single()
                if (error) throw error
                savedId = data.id
            }

            // 2. Delete existing items (Replacement strategy is easiest for ordering)
            // Implementation detail: Delete all for this collection, then re-insert. 
            // Better: Upsert by ID? Since we use local state, full replacement is safer for positions.
            if (savedId) {
                // Delete all
                await supabase.from('collection_items').delete().eq('collection_id', savedId)

                // Insert all
                const itemsToInsert = items.map((item, index) => ({
                    collection_id: savedId,
                    content_type: item.content_type,
                    content_id: item.content_id,
                    position: index
                }))

                if (itemsToInsert.length > 0) {
                    const { error: itemsError } = await supabase
                        .from('collection_items')
                        .insert(itemsToInsert)
                    if (itemsError) throw itemsError
                }

                if (!collectionId) {
                    // Redirect to edit mode if new
                    router.push(`/studio/collection?id=${savedId}`)
                } else {
                    alert("Collection Saved!")
                }
            }

        } catch (error) {
            console.error("Save failed:", error)
            alert("Failed to save collection")
        } finally {
            setIsSaving(false)
        }
    }

    const addItem = (selectedItems: any[]) => {
        // Append new items
        const newItemsFormatted = selectedItems.map(i => ({
            id: generateId(), // Temporary ID for React key
            content_type: i.type,
            content_id: i.id,
            title: i.title,
            position: items.length
        }))
        setItems([...items, ...newItemsFormatted])
        setIsPickerOpen(false)
    }

    const removeItem = (index: number) => {
        const newItems = [...items]
        newItems.splice(index, 1)
        setItems(newItems)
    }

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === items.length - 1) return

        const newItems = [...items]
        const temp = newItems[index]
        newItems[index] = newItems[index + (direction === 'up' ? -1 : 1)]
        newItems[index + (direction === 'up' ? -1 : 1)] = temp
        setItems(newItems)
    }

    if (isLoading) return <div className="p-10 text-center">Loading...</div>

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/studio" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <span className="text-sm font-medium text-emerald-500 uppercase tracking-wider">Collection Editor</span>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="block bg-transparent text-2xl font-bold text-white focus:outline-none focus:border-b border-white/20 w-full"
                        />
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Collection"}
                </button>
            </div>

            {/* Config */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 min-h-[80px]"
                        placeholder="What is this collection about?"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                    <div className="relative group max-w-xs">
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value as Subject)}
                            className="w-full appearance-none bg-black/20 border border-white/10 rounded-lg px-4 py-2 pr-10 text-gray-300 focus:outline-none focus:border-emerald-500 hover:bg-white/5 transition-colors"
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
                </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Collection Content</h3>
                    <button
                        onClick={() => setIsPickerOpen(true)}
                        className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        <Library className="w-4 h-4" /> Add Existing Content
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                        <p className="text-gray-500 mb-4">No content added yet.</p>
                        <button
                            onClick={() => setIsPickerOpen(true)}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                        >
                            Open Library
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {items.map((item, index) => {
                            const Icon = Icons[item.content_type as keyof typeof Icons] || FileText
                            return (
                                <div key={item.id || index} className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10 group">
                                    <div className="text-gray-500 cursor-grab active:cursor-grabbing p-1">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div className="p-2 bg-black/20 rounded-lg text-emerald-500">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-medium">{item.title}</h4>
                                        <span className="text-xs text-gray-500 capitalize">{item.content_type}</span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => moveItem(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => moveItem(index, 'down')}
                                            disabled={index === items.length - 1}
                                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={() => removeItem(index)}
                                            className="p-1 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Picker Modal */}
            {isPickerOpen && (
                <ResourcePicker
                    isOpen={isPickerOpen}
                    onClose={() => setIsPickerOpen(false)}
                    onSelect={addItem}
                />
            )}
        </div>
    )
}

export default function CollectionEditorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CollectionEditor />
        </Suspense>
    )
}
