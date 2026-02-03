"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Trash2, UserCog, Loader2, Search } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    const [professors, setProfessors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ id: "", password: "", display_name: "" })
    const [searchTerm, setSearchTerm] = useState("")
    const [actionLoading, setActionLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const [activeTab, setActiveTab] = useState<'users' | 'content'>('users')
    const [content, setContent] = useState<any[]>([])

    // Redirect if not admin
    useEffect(() => {
        if (!isLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/')
            }
        }
    }, [user, isLoading, router])

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchProfessors()
            fetchContent()
        }
    }, [user])

    const fetchProfessors = async () => {
        const { data } = await supabase.from('professors').select('*').order('created_at', { ascending: false })
        if (data) setProfessors(data)
        setLoading(false)
    }

    const fetchContent = async () => {
        // Fetch all content types
        const [quizzes, courses, flashcards, exercises] = await Promise.all([
            supabase.from('quizzes').select('id, title, created_by, created_at, subject, professors(display_name)'),
            supabase.from('courses').select('id, title, created_by, created_at, subject, professors(display_name)'),
            supabase.from('flashcards').select('id, title, created_by, created_at, subject, professors(display_name)'),
            supabase.from('exercises').select('id, title, created_by, created_at, subject, professors(display_name)')
        ])

        const updates = [
            ...(quizzes.data || []).map(q => ({ ...q, type: 'quiz' })),
            ...(courses.data || []).map(c => ({ ...c, type: 'course' })),
            ...(flashcards.data || []).map(f => ({ ...f, type: 'flashcard' })),
            ...(exercises.data || []).map(e => ({ ...e, type: 'exercise' }))
        ]

        // Sort by newest
        updates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setContent(updates)
    }

    const handleDeleteContent = async (id: string, type: 'quiz' | 'course' | 'flashcard' | 'exercise') => {
        if (!confirm("Are you sure you want to delete this content? This cannot be undone.")) return

        setActionLoading(true)
        try {
            const tableMap: Record<string, string> = {
                quiz: 'quizzes',
                course: 'courses',
                flashcard: 'flashcards',
                exercise: 'exercises'
            }
            const table = tableMap[type]
            const { error } = await supabase.from(table).delete().eq('id', id)

            if (error) throw error

            setMessage({ type: 'success', text: "Content deleted successfully" })
            fetchContent()
        } catch (error: any) {
            setMessage({ type: 'error', text: "Failed to delete content: " + error.message })
        } finally {
            setActionLoading(false)
        }
    }

    const filteredContent = content.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.professors?.display_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleEditClick = (prof: any) => {
        setEditingId(prof.id)
        setEditForm({
            id: prof.id,
            password: prof.password,
            display_name: prof.display_name
        })
    }

    const handleSave = async () => {
        if (!editingId) return
        setActionLoading(true)
        setMessage(null)

        try {
            // If ID changed, we need to handle that carefully
            // BUT Supabase Primary Key updates can be tricky if not CASCADE
            // We'll trust our schema update

            const { error } = await supabase
                .from('professors')
                .update({
                    id: editForm.id,
                    password: editForm.password,
                    display_name: editForm.display_name
                })
                .eq('id', editingId) // Use the OLD id to find the record

            if (error) throw error

            setMessage({ type: 'success', text: "User updated successfully" })
            setEditingId(null)
            fetchProfessors()
        } catch (error: any) {
            console.error(error)
            setMessage({ type: 'error', text: "Failed to update: " + error.message })
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete all content created by this user!")) return

        setActionLoading(true)
        try {
            const { error } = await supabase
                .from('professors')
                .delete()
                .eq('id', id)

            if (error) throw error

            setMessage({ type: 'success', text: "User deleted" })
            fetchProfessors()
        } catch (error: any) {
            setMessage({ type: 'error', text: "Failed to delete: " + error.message })
        } finally {
            setActionLoading(false)
        }
    }

    const filteredProfs = professors.filter(p =>
        p.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading || (user?.role !== 'admin' && loading)) {
        return <div className="flex justify-center items-center h-screen text-white">Loading Admin Panel...</div>
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/settings" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <UserCog className="w-8 h-8 text-indigo-500" />
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-400">Manage Professor Accounts and Credentials</p>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {message.text}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'users' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Users Management
                        {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'content' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Content Management
                        {activeTab === 'content' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500" />}
                    </button>
                </div>

                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder={activeTab === 'users' ? "Search users..." : "Search content by title or author..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-indigo-500/50 focus:outline-none"
                    />
                </div>

                {activeTab === 'users' ? (
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                                    <th className="p-4 font-medium">Display Name</th>
                                    <th className="p-4 font-medium">User ID (Login)</th>
                                    <th className="p-4 font-medium">Password</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredProfs.map(prof => (
                                    <tr key={prof.id} className="hover:bg-white/5 transition-colors group">
                                        {editingId === prof.id ? (
                                            <>
                                                <td className="p-3">
                                                    <input
                                                        value={editForm.display_name}
                                                        onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/20 rounded px-2 py-1"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        value={editForm.id}
                                                        onChange={(e) => setEditForm({ ...editForm, id: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 font-mono text-sm"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        value={editForm.password}
                                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 font-mono text-sm"
                                                    />
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={handleSave}
                                                            disabled={actionLoading}
                                                            className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                                                        >
                                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-2 bg-white/5 text-gray-400 rounded hover:bg-white/10"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-4 font-medium text-white">{prof.display_name}</td>
                                                <td className="p-4 font-mono text-sm text-indigo-300">{prof.id}</td>
                                                <td className="p-4 font-mono text-sm text-gray-500 group-hover:text-white transition-colors">{prof.password}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditClick(prof)}
                                                            className="px-3 py-1.5 bg-white/5 text-sm rounded hover:bg-white/10"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(prof.id)}
                                                            className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && filteredProfs.length === 0 && (
                            <div className="p-8 text-center text-gray-500">No users found.</div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                                    <th className="p-4 font-medium">Title</th>
                                    <th className="p-4 font-medium">Type</th>
                                    <th className="p-4 font-medium">Author</th>
                                    <th className="p-4 font-medium">Created At</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredContent.map(item => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-medium text-white">{item.title}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'quiz' ? 'bg-purple-500/20 text-purple-400' :
                                                    item.type === 'course' ? 'bg-blue-500/20 text-blue-400' :
                                                        item.type === 'flashcard' ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {item.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                            {item.professors?.display_name || 'Unknown'}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteContent(item.id, item.type)}
                                                className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete this content"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && filteredContent.length === 0 && (
                            <div className="p-8 text-center text-gray-500">No content found matching search.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
