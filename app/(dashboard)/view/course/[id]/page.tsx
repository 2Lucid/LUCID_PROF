"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, FileText, GitFork, Loader2 } from "lucide-react"
import Link from "next/link"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import { useRemix } from "@/hooks/use-remix"
import { useAuth } from "@/components/providers/auth-provider"

export default function CourseViewPage() {
    const params = useParams()
    const id = params.id as string
    const { user } = useAuth()
    const { remixContent, isRemixing } = useRemix()

    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourse = async () => {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching course:', error)
            } else {
                setCourse(data)
            }
            setLoading(false)
        }

        if (id) fetchCourse()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">Course not found</h2>
                <Link href="/my-work" className="text-accent hover:underline">Return to My Work</Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/global" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-accent mb-1">
                            <FileText className="w-5 h-5" />
                            <span className="text-sm font-medium uppercase tracking-wider">Course Preview</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold text-white">{course.title}</h1>
                            {course.verification_status === 'verified' && <VerifiedBadge />}
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

                    {user && user.id !== course.created_by && (
                        <button
                            onClick={() => remixContent(course, 'course')}
                            disabled={isRemixing}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                        >
                            {isRemixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitFork className="w-4 h-4" />}
                            Remix
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-6 prose prose-invert max-w-none">
                {course.content && Array.isArray(course.content) && course.content.map((block: any) => {
                    switch (block.type) {
                        case 'h1':
                            return <h1 key={block.id} className="text-4xl font-bold text-white mt-8 mb-4">{block.content}</h1>
                        case 'h2':
                            return <h2 key={block.id} className="text-2xl font-bold text-white mt-6 mb-3">{block.content}</h2>
                        case 'bullet':
                            return (
                                <div key={block.id} className="flex gap-2 items-start text-gray-300 my-2">
                                    <span className="text-accent mt-1.5">•</span>
                                    <span>{block.content}</span>
                                </div>
                            )
                        case 'quote':
                            return (
                                <blockquote key={block.id} className="border-l-4 border-accent pl-4 italic text-gray-400 my-4">
                                    {block.content}
                                </blockquote>
                            )
                        default:
                            return <p key={block.id} className="text-gray-300 leading-relaxed my-2">{block.content}</p>
                    }
                })}
            </div>
        </div>
    )
}
