"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CourseBlock } from "@/components/studio/course/course-block"
import { Save, ArrowLeft, FileText, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { generateId } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import { SUBJECTS, Subject } from "@/lib/constants/subjects"
import { AIGeneratorModal } from "@/components/studio/ai-generator-modal"

interface Block {
    id: string
    type: "text" | "h1" | "h2" | "bullet" | "quote"
    content: string
}

function CourseEditor() {
    const searchParams = useSearchParams()
    const courseId = searchParams.get('id')

    const [title, setTitle] = useState("Untitled Course")
    const [selectedSubject, setSelectedSubject] = useState<Subject | "">("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [blocks, setBlocks] = useState<Block[]>([
        { id: "1", type: "h1", content: "Introduction to React Hooks" },
        { id: "2", type: "text", content: "" }
    ])
    const [isLoading, setIsLoading] = useState(!!courseId)

    const { user } = useAuth()

    useEffect(() => {
        if (courseId && user) {
            const fetchCourse = async () => {
                const { data, error } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('id', courseId)
                    .single()

                if (error) {
                    console.error('Error fetching course:', error)
                    return
                }

                if (data) {
                    setTitle(data.title)
                    setBlocks(data.content || [])
                    setSelectedSubject(data.subject || "")
                    setSelectedCategory(data.category || "")
                }
                setIsLoading(false)
            }
            fetchCourse()
        }
    }, [courseId, user])

    const updateBlock = (id: string, content: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b))
    }

    const changeBlockType = (id: string, type: Block["type"]) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, type } : b))
    }

    const deleteBlock = (id: string) => {
        if (blocks.length > 1) {
            setBlocks(blocks.filter(b => b.id !== id))
        }
    }

    const addBlockAfter = (currentId: string) => {
        const currentIndex = blocks.findIndex(b => b.id === currentId)
        const newBlock: Block = { id: generateId(), type: "text", content: "" }

        const newBlocks = [...blocks]
        newBlocks.splice(currentIndex + 1, 0, newBlock)
        setBlocks(newBlocks)
    }

    const [isSaving, setIsSaving] = useState(false)

    const saveCourse = async () => {
        if (!user) {
            alert("You must be logged in to save.")
            return
        }
        setIsSaving(true)
        try {
            const courseData = {
                title,
                created_by: user.id,
                content: blocks,
                subject: selectedSubject,
                category: selectedCategory,
                status: 'published'
            }

            let error;
            if (courseId) {
                const { error: updateError } = await supabase
                    .from('courses')
                    .update(courseData)
                    .eq('id', courseId)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('courses')
                    .insert(courseData)
                error = insertError
            }

            if (error) throw error
            alert(courseId ? "Course updated successfully!" : "Course saved successfully!")
        } catch (err: any) {
            console.error(err)
            alert(`Error saving course: ${err.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto pb-32">
            {/* Header */}
            <div className="flex items-center justify-between mb-12 sticky top-0 bg-background/80 backdrop-blur-md z-20 py-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Link href="/studio" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2 text-accent">
                        <AIGeneratorModal
                            type="course"
                            onGenerate={(data) => {
                                if (data.title) setTitle(data.title)
                                if (data.content) {
                                    const newBlocks = data.content.map((b: any) => ({
                                        id: generateId(),
                                        type: b.type,
                                        content: b.content
                                    }))
                                    setBlocks(newBlocks)
                                }
                            }}
                        />
                        <FileText className="w-5 h-5" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Course Editor</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-3 py-1.5 text-xs font-medium text-gray-400 border border-white/10 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
                        Preview
                    </button>
                    <button
                        onClick={saveCourse}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors shadow-[0_0_15px_rgba(192,132,252,0.3)] disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> {isSaving ? "Publishing..." : "Publish"}
                    </button>
                </div>
            </div>

            {/* Document Area */}
            <div className="pl-16 pr-8">
                {/* Title Input as part of document */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Course Title"
                    className="w-full bg-transparent text-5xl font-bold text-white placeholder:text-gray-700 focus:outline-none mb-4"
                />

                {/* Organization Controls */}
                <div className="flex gap-4 mb-8">
                    <div className="relative group">
                        <select
                            value={selectedSubject}
                            onChange={(e) => {
                                setSelectedSubject(e.target.value as Subject)
                                setSelectedCategory("")
                            }}
                            className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-gray-300 focus:outline-none focus:border-accent hover:bg-white/10 transition-colors"
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
                            className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-gray-300 focus:outline-none focus:border-accent hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                <div className="space-y-1">
                    {blocks.map((block) => (
                        <CourseBlock
                            key={block.id}
                            id={block.id}
                            block={block}
                            onUpdate={updateBlock}
                            onDelete={deleteBlock}
                            onTypeChange={changeBlockType}
                            onEnter={addBlockAfter}
                        />
                    ))}
                </div>

                <div
                    onClick={() => addBlockAfter(blocks[blocks.length - 1].id)}
                    className="h-32 flex items-center text-gray-700 cursor-text hover:text-gray-600 transition-colors"
                >
                    Click to add content...
                </div>
            </div>
        </div>
    )
}

export default function CoursePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>}>
            <CourseEditor />
        </Suspense>
    )
}
