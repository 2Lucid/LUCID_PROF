"use client"

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { Check, X, AlertCircle } from "lucide-react"
import { useState } from "react"

interface ValidationItem {
    id: string
    type: "Question" | "Fact" | "Definition"
    content: string
    metadata?: string
    submittedBy: string
}

export function ValidationCard({ item, onSwipe }: { item: ValidationItem; onSwipe: (direction: "left" | "right") => void }) {
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-10, 10])
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

    // Color overlays logic
    const rejectOpacity = useTransform(x, [-100, 0], [1, 0])
    const acceptOpacity = useTransform(x, [0, 100], [0, 1])

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x > 100) {
            onSwipe("right")
        } else if (info.offset.x < -100) {
            onSwipe("left")
        }
    }

    return (
        <motion.div
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute top-0 w-full max-w-lg cursor-grab active:cursor-grabbing"
        >
            <div className="relative overflow-hidden rounded-3xl bg-[#1a0f2e] border border-white/10 shadow-2xl h-[500px] flex flex-col">
                {/* Status Indicators (Overlays) */}
                <motion.div style={{ opacity: acceptOpacity }} className="absolute inset-0 bg-green-500/20 z-10 pointer-events-none flex items-center justify-center">
                    <Check className="w-32 h-32 text-green-400 border-4 border-green-400 rounded-full p-4" />
                </motion.div>
                <motion.div style={{ opacity: rejectOpacity }} className="absolute inset-0 bg-red-500/20 z-10 pointer-events-none flex items-center justify-center">
                    <X className="w-32 h-32 text-red-500 border-4 border-red-500 rounded-full p-4" />
                </motion.div>

                {/* Card Content */}
                <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-semibold text-accent border border-white/10 uppercase tracking-wider">
                            {item.type}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Submitted by {item.submittedBy}</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center text-center">
                        <h3 className="text-2xl font-bold text-white leading-relaxed">
                            {item.content}
                        </h3>
                        {item.metadata && (
                            <p className="mt-4 text-gray-400 italic">
                                "{item.metadata}"
                            </p>
                        )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5 flex gap-2 justify-center text-sm text-gray-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>Swipe Right to Validate, Left to Reject</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
