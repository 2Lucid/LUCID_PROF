"use client"

import { useState, useEffect } from "react"
import { X, Search, CheckCircle2, Circle, BookOpen, FileText, BrainCircuit, Dumbbell, Filter } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"

type ResourceType = 'quiz' | 'course' | 'flashcards' | 'exercises'

interface Resource {
    id: string
    title: string
    type: ResourceType
    subject: string
    created_at: string
}

interface ResourcePickerProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (selected: Resource[]) => void
}

const Icons = {
    quiz: BookOpen,
    course: FileText,
    flashcards: BrainCircuit,
    exercises: Dumbbell
}

export function ResourcePicker({ isOpen, onClose, onSelect }: ResourcePickerProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [resources, setResources] = useState<Resource[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState("")
    const [filterType, setFilterType] = useState<ResourceType | 'all'>('all')

    useEffect(() => {
        if (!isOpen || !user) return

        const fetchResources = async () => {
            setLoading(true)
            try {
                const tables: ResourceType[] = ['quiz', 'course', 'flashcards', 'exercises']
                const tableNames = { quiz: 'quizzes', course: 'courses', flashcards: 'flashcards', exercises: 'exercises' }

                let allData: Resource[] = []

                // Parallel fetch
                await Promise.all(tables.map(async (type) => {
                    const { data } = await supabase
                        .from(tableNames[type])
                        .select('id, title, subject, created_at')
                        .eq('created_by', user.id)
                        .order('created_at', { ascending: false })

                    if (data) {
                        const mapped = data.map(item => ({
                            ...item,
                            type
                        }))
                        allData = [...allData, ...mapped]
                    }
                }))

                // Sort by newest
                allData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                setResources(allData)

            } catch (error) {
                console.error("Fetch error:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchResources()
    }, [isOpen, user])

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    const handleConfirm = () => {
        const selectedResources = resources.filter(r => selectedIds.has(r.id))
        onSelect(selectedResources)
    }

    const filteredResources = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase())
        const matchesType = filterType === 'all' || r.type === filterType
        return matchesSearch && matchesType
    })

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Select Content</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-white/10 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search your library..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
                    >
                        <option value="all">All Types</option>
                        <option value="quiz">Quizzes</option>
                        <option value="course">Courses</option>
                        <option value="flashcards">Flashcards</option>
                        <option value="exercises">Exercises</option>
                    </select>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No content found matching your filters.</p>
                    ) : (
                        filteredResources.map(resource => {
                            const Icon = Icons[resource.type]
                            const isSelected = selectedIds.has(resource.id)
                            return (
                                <div
                                    key={resource.id}
                                    onClick={() => toggleSelection(resource.id)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isSelected
                                            ? 'bg-emerald-500/10 border-emerald-500/50'
                                            : 'bg-white/5 border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    {isSelected ? (
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-gray-600" />
                                    )}

                                    <div className="p-2 bg-black/20 rounded-lg text-gray-400">
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1">
                                        <h4 className={`font-medium ${isSelected ? 'text-emerald-100' : 'text-gray-300'}`}>{resource.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                            <span className="capitalize">{resource.type}</span>
                                            <span>•</span>
                                            <span>{resource.subject || 'General'}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedIds.size === 0}
                        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Selected ({selectedIds.size})
                    </button>
                </div>
            </div>
        </div>
    )
}
