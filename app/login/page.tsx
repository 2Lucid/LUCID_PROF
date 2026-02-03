"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Lock, User, ArrowRight, AlertCircle, Sparkles, Zap, BrainCircuit } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
    const [id, setId] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const router = useRouter()
    const { login } = useAuth()

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        // Artificial delay for interaction feel
        await new Promise(r => setTimeout(r, 800))

        const res = await login(id, password)

        if (res.error) {
            setError(res.error)
            setIsSubmitting(false)
        } else {
            router.push('/')
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#020105] text-white selection:bg-primary/30">
            {/* Dynamic Background Effects */}
            <div
                className="absolute inset-0 opacity-20 transition-transform duration-[2s] ease-out pointer-events-none"
                style={{
                    background: `radial-gradient(1000px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`
                }}
            />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] rounded-full bg-primary/10 blur-[120px]"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.5, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[800px] h-[800px] rounded-full bg-secondary/10 blur-[120px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[420px] relative z-10"
            >
                {/* Logo & Header */}
                <div className="text-center mb-10 relative">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 mx-auto bg-gradient-to-br from-primary via-violet-500 to-secondary rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.5)] mb-6 relative group"
                    >
                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <BrainCircuit className="w-10 h-10 text-white relative z-10" />
                    </motion.div>

                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                        Lucid Prof
                    </h1>
                    <p className="text-gray-400 mt-3 text-lg font-light">
                        Next-Gen Educational Intelligence
                    </p>
                </div>

                {/* Login Card */}
                <div className="relative group perspective-1000">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur-lg"></div>
                    <div className="relative backdrop-blur-xl bg-black/40 border border-white/10 p-8 rounded-2xl shadow-2xl">

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3 text-red-400 text-sm overflow-hidden"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-5">
                                <div className="space-y-2 group/input">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1 group-focus-within/input:text-primary transition-colors">Professor ID</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-500 group-focus-within/input:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            value={id}
                                            onChange={(e) => setId(e.target.value)}
                                            placeholder="LUCID_PROF_01"
                                            className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-transparent focus:bg-white/10 transition-all duration-300 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 group/input">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1 group-focus-within/input:text-primary transition-colors">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-500 group-focus-within/input:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-transparent focus:bg-white/10 transition-all duration-300 outline-none"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none opacity-0 group-focus-within/input:opacity-100 transition-opacity">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full relative overflow-hidden group py-3.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <Sparkles className="w-4 h-4 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            Access Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </motion.button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-8 text-sm text-gray-500 flex items-center justify-center gap-2"
                >
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span>Powered by Advanced AI Logic</span>
                </motion.div>
            </motion.div>
        </div>
    )
}
