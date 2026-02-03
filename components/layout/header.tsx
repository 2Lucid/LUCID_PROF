"use client"

import { Bell, Search } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

export function Header() {
    const { user } = useAuth()
    return (
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            {/* Search Bar (Visual only for now) */}
            <div className="relative w-96 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search courses, students, or content..."
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
            </div>

            {/* Right User Area */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-white">
                            Bonjour: {user ? (user.display_name || user.id) : "Guest"}
                        </p>
                        <p className="text-xs text-secondary">Verified Educator</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                        {user ? (user.display_name?.[0] || "P") : "G"}
                    </div>
                </div>
            </div>
        </header>
    )
}
