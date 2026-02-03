"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Shield, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SetupAdminPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState("")

    const createAdmin = async () => {
        setStatus('loading')
        try {
            // 1. Try to insert the admin user
            const { error } = await supabase
                .from('professors')
                .upsert({
                    id: 'tanguy',
                    display_name: 'Tanguy Admin',
                    password: 'duvert',
                    subject: 'Administration'
                })
                .select()
                .single()

            if (error) throw error

            setStatus('success')
            setMessage("Admin account 'tanguy' created successfully!")
        } catch (error: any) {
            console.error(error)
            setStatus('error')
            setMessage(error.message || "Failed to create admin")
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-indigo-500" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Admin Setup</h1>
                <p className="text-gray-400 mb-8">
                    Click the button below to force-create the admin account (tanguy / duvert).
                </p>

                {status === 'idle' && (
                    <button
                        onClick={createAdmin}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                    >
                        Create Admin Account
                    </button>
                )}

                {status === 'loading' && (
                    <div className="text-indigo-400 animate-pulse">Creating account...</div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-left">
                            <CheckCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                        <Link href="/login" className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors">
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-left">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                        <button
                            onClick={createAdmin}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
