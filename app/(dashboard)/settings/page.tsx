"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, User, Bell, Shield, Palette, Globe, BookOpen, Check } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/providers/language-provider"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"

const SUBJECTS = [
    "Mathématiques",
    "Histoire",
    "Géographie",
    "Physique-Chimie",
    "SVT",
    "Français",
    "Anglais",
    "Philosophie",
    "Espagnol",
    "Allemand"
]

export default function SettingsPage() {
    const { t, language, setLanguage } = useLanguage()
    const { user, updateUser } = useAuth()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [displayName, setDisplayName] = useState("")
    const [subject, setSubject] = useState("")
    const [additionalSubjects, setAdditionalSubjects] = useState<string[]>([])
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        if (user?.id) {
            fetchUserProfile()
        }
    }, [user?.id])

    const fetchUserProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('professors')
                .select('display_name, subject, additional_subjects')
                .eq('id', user?.id)
                .single()

            if (error) throw error

            if (data) {
                setDisplayName(data.display_name || "")
                setSubject(data.subject || "")
                setAdditionalSubjects(data.additional_subjects || [])
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!user?.id) return
        setSaving(true)
        setMessage(null)

        try {
            const { error } = await supabase
                .from('professors')
                .update({
                    display_name: displayName,
                    subject: subject,
                    additional_subjects: additionalSubjects
                })
                .eq('id', user.id)

            if (error) throw error

            // Update local session
            updateUser({
                display_name: displayName
            })

            setMessage({ type: 'success', text: "Settings saved successfully" })

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            console.error('Error saving settings:', error)
            setMessage({ type: 'error', text: "Failed to save settings" })
        } finally {
            setSaving(false)
        }
    }

    const toggleAdditionalSubject = (sub: string) => {
        setAdditionalSubjects(prev => {
            if (prev.includes(sub)) {
                return prev.filter(s => s !== sub)
            } else {
                if (prev.length >= 3) {
                    setMessage({ type: 'error', text: "You can select up to 3 additional subjects only." })
                    setTimeout(() => setMessage(null), 3000)
                    return prev
                }
                return [...prev, sub]
            }
        })
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh] text-white">Loading settings...</div>
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-bold text-white">{t('settings.title')}</h1>
            </div>

            <div className="space-y-6">

                {user?.role === 'admin' && (
                    <div className="glass-card p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-red-500" />
                                <div>
                                    <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
                                    <p className="text-sm text-gray-400">Manage all professor accounts and credentials.</p>
                                </div>
                            </div>
                            <Link href="/admin" className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors font-medium">
                                Access Panel
                            </Link>
                        </div>
                    </div>
                )}

                {/* Language Section */}
                <div className="glass-card p-6 border-l-4 border-indigo-500">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl font-bold text-white">{t('settings.language.title')}</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">{t('settings.language.desc')}</p>
                        <div className="flex bg-white/5 rounded-lg p-1">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'en'
                                    ? 'bg-indigo-500 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {t('settings.language.options.en')}
                            </button>
                            <button
                                onClick={() => setLanguage('fr')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'fr'
                                    ? 'bg-indigo-500 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {t('settings.language.options.fr')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Professional Information */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-xl font-bold text-white">Professional Information</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Main Subject */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Main Subject (What you teach)
                            </label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-gray-900 text-gray-400">Select your main subject</option>
                                {SUBJECTS.map((sub) => (
                                    <option key={sub} value={sub} className="bg-gray-900">{sub}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Your main subject will be used to personalize your dashboard.
                            </p>
                        </div>

                        {/* Additional Validation Subjects */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Additional Subjects to Validate
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {SUBJECTS.map((sub) => {
                                    const isSelected = additionalSubjects.includes(sub)
                                    return (
                                        <button
                                            key={sub}
                                            onClick={() => toggleAdditionalSubject(sub)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-medium ${isSelected
                                                ? 'bg-primary/20 border-primary/50 text-white'
                                                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <span>{sub}</span>
                                            {isSelected && <Check className="w-4 h-4 text-primary" />}
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                You will see content from these subjects in the Validation page, in addition to your main subject.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-white">{t('settings.profile.title')}</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">{t('settings.profile.displayName')}</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary/50 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">{t('settings.profile.email')}</label>
                            <input
                                type="email"
                                defaultValue="prof@example.com"
                                disabled
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="w-5 h-5 text-secondary" />
                        <h2 className="text-xl font-bold text-white">{t('settings.notifications.title')}</h2>
                    </div>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-gray-300">{t('settings.notifications.email')}</span>
                            <input type="checkbox" defaultChecked className="accent-primary w-5 h-5" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-gray-300">{t('settings.notifications.validation')}</span>
                            <input type="checkbox" defaultChecked className="accent-primary w-5 h-5" />
                        </label>
                    </div>
                </div>

                {/* Appearance */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Palette className="w-5 h-5 text-accent" />
                        <h2 className="text-xl font-bold text-white">{t('settings.appearance.title')}</h2>
                    </div>
                    <p className="text-sm text-gray-400">{t('settings.appearance.desc')}</p>
                </div>

                <div className="sticky bottom-4">
                    {message && (
                        <div className={`mb-4 p-4 rounded-xl border ${message.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                            } backdrop-blur-md`}>
                            {message.text}
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : t('settings.save')}
                    </button>
                </div>
            </div>
        </div>
    )
}
