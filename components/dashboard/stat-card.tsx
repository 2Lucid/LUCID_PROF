import { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string
    value: string
    trend?: string
    icon: LucideIcon
    color: "primary" | "secondary" | "accent" | "success" | "warning" | "danger"
}

export function StatCard({ title, value, trend, icon: Icon, color }: StatCardProps) {
    const colorStyles = {
        primary: "from-primary/20 to-primary/5 border-primary/20 text-primary",
        secondary: "from-secondary/20 to-secondary/5 border-secondary/20 text-secondary",
        accent: "from-accent/20 to-accent/5 border-accent/20 text-accent",
        success: "from-success/20 to-success/5 border-success/20 text-success",
        warning: "from-warning/20 to-warning/5 border-warning/20 text-warning",
        danger: "from-danger/20 to-danger/5 border-danger/20 text-danger",
    }

    return (
        <div className={`relative overflow-hidden rounded-2xl border p-6 bg-gradient-to-br transition-all hover:scale-[1.02] cursor-default ${colorStyles[color]} border-opacity-50`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold text-white tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-white/5 backdrop-blur-md`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <span>{trend}</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                </div>
            )}
        </div>
    )
}
