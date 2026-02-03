import { BadgeCheck } from "lucide-react"

export function VerifiedBadge({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5"
    }

    return (
        <div className={`inline-flex items-center gap-1 ${className}`} title="Verified Content">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-[6px] opacity-40 rounded-full"></div>
                <BadgeCheck className={`${sizeClasses[size]} text-blue-400 fill-blue-500/10 relative z-10`} />
            </div>
            {size !== 'sm' && <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Verified</span>}
        </div>
    )
}
