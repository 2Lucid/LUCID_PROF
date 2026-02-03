"use client"

import Link from "next/link"
import { PenTool, BrainCircuit, FileText, Dumbbell, ArrowRight, Layers } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

export default function StudioPage() {
    const { t } = useLanguage()

    // Define tools inside component to access `t`
    const tools = [
        {
            title: t('studio.tools.quiz.title'),
            description: t('studio.tools.quiz.desc'),
            icon: PenTool,
            href: "/studio/quiz",
            color: "primary",
            gradient: "from-primary/20 to-primary/5",
            border: "border-primary/20",
            textData: "bg-primary/20 text-primary"
        },
        {
            title: t('studio.tools.flashcard.title'),
            description: t('studio.tools.flashcard.desc'),
            icon: BrainCircuit,
            href: "/studio/flashcards",
            color: "secondary",
            gradient: "from-secondary/20 to-secondary/5",
            border: "border-secondary/20",
            textData: "bg-secondary/20 text-secondary"
        },
        {
            title: t('studio.tools.course.title'),
            description: t('studio.tools.course.desc'),
            icon: FileText,
            href: "/studio/course",
            color: "accent",
            gradient: "from-accent/20 to-accent/5",
            border: "border-accent/20",
            textData: "bg-accent/20 text-accent"
        },
        {
            title: t('studio.tools.exercise.title'),
            description: t('studio.tools.exercise.desc'),
            icon: Dumbbell,
            href: "/studio/exercises",
            color: "emerald",
            gradient: "from-emerald-500/20 to-emerald-500/5",
            border: "border-emerald-500/20",
            textData: "bg-emerald-500/20 text-emerald-500"
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('studio.title')}</h1>
                    <p className="text-gray-400 mt-1">{t('studio.subtitle')}</p>
                </div>
                <Link
                    href="/studio/collection"
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-colors font-medium"
                >
                    <Layers className="w-5 h-5" />
                    Create Collection
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {tools.map((tool) => (
                    <Link
                        key={tool.href}
                        href={tool.href}
                        className={`group relative overflow-hidden rounded-2xl border p-8 transition-all hover:scale-[1.01] hover:shadow-2xl ${tool.gradient} ${tool.border} border-opacity-50 hover:bg-white/5`}
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12 scale-150">
                            <tool.icon className="w-48 h-48" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${tool.textData}`}>
                                <tool.icon className="w-7 h-7" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-3">{tool.title}</h3>
                            <p className="text-gray-400 leading-relaxed mb-8 flex-1">
                                {tool.description}
                            </p>

                            <div className="flex items-center text-sm font-semibold text-white group-hover:translate-x-2 transition-transform">
                                Launch Tool <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
