"use client"

import { Check, X, FileText } from "lucide-react"

interface CourseValidationProps {
    item: any
    onValidate: (approved: boolean) => void
}

export function CourseValidation({ item, onValidate }: CourseValidationProps) {
    return (
        <div className="h-full glass-card rounded-2xl p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-accent/20">
                    <FileText className="w-5 h-5 text-accent" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Course Lesson</h3>
                    <p className="text-xs text-gray-500">{item.metadata}</p>
                </div>
            </div>

            {/* Content Preview */}
            <div className="flex-1 bg-white/5 rounded-xl p-6 mb-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-4">
                    {item.content?.title || "Course Content"}
                </h2>
                <div className="space-y-3 text-gray-300">
                    {(() => {
                        // Handle both: direct array OR nested content.content
                        const blocks = Array.isArray(item.content)
                            ? item.content
                            : (item.content?.content || [])

                        if (blocks.length > 0) {
                            return blocks.map((block: any, idx: number) => {
                                if (block.type === 'h1') return <h3 key={idx} className="text-xl font-bold text-white mt-4 first:mt-0">{block.content}</h3>
                                if (block.type === 'h2') return <h4 key={idx} className="text-lg font-semibold text-gray-200 mt-3">{block.content}</h4>
                                if (block.type === 'bullet') return <li key={idx} className="ml-4 list-disc">{block.content}</li>
                                return <p key={idx}>{block.content}</p>
                            })
                        }
                        return <p>No preview available</p>
                    })()}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={() => onValidate(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all"
                >
                    <X className="w-5 h-5" />
                    Reject
                </button>
                <button
                    onClick={() => onValidate(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500/20 text-green-400 font-bold hover:bg-green-500 hover:text-white transition-all"
                >
                    <Check className="w-5 h-5" />
                    Approve
                </button>
            </div>
        </div>
    )
}
