"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CheckCircle2, PenTool, Settings, LogOut, Briefcase, Globe, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/providers/language-provider"
import { useAuth } from "@/components/providers/auth-provider"

export function Sidebar() {
    const pathname = usePathname()
    const { t } = useLanguage()
    const { logout } = useAuth()

    const navigation = [
        { name: t('sidebar.dashboard'), href: "/", icon: LayoutDashboard },
        { name: t('sidebar.myWork'), href: "/my-work", icon: Briefcase },
        { name: t('sidebar.global'), href: "/global", icon: Globe },
        { name: t('sidebar.validation'), href: "/validation", icon: CheckCircle2 },
        { name: t('sidebar.studio'), href: "/studio", icon: PenTool },
        { name: t('sidebar.stats'), href: "/stats", icon: BarChart2 },
        { name: t('sidebar.settings'), href: "/settings", icon: Settings },
    ]

    return (
        <div className="flex flex-col h-full w-64 glass border-r border-white/5 p-4">
            {/* Logo Area */}
            <div className="flex items-center gap-2 px-2 py-6 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Lucid Prof
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-gray-400 group-hover:text-white")} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="mt-auto">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    {t('sidebar.signOut')}
                </button>
            </div>
        </div>
    )
}
