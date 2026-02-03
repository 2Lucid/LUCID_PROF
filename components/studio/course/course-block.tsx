"use client"

import { useState, useRef, useEffect } from "react"
import { GripVertical, X, Type, Heading1, Heading2, List, Quote } from "lucide-react"

interface Block {
    id: string
    type: "text" | "h1" | "h2" | "bullet" | "quote"
    content: string
}

interface BlockEditorProps {
    id: string
    block: Block
    onUpdate: (id: string, content: string) => void
    onDelete: (id: string) => void
    onTypeChange: (id: string, type: Block["type"]) => void
    onEnter: (id: string) => void
}

export function CourseBlock({ id, block, onUpdate, onDelete, onTypeChange, onEnter }: BlockEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [block.content])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onEnter(id)
        }
        if (e.key === 'Backspace' && block.content === "") {
            e.preventDefault()
            onDelete(id)
        }
        if (e.key === '/') {
            // Logic for slash commands could go here
        }
    }

    const styles = {
        text: "text-base text-gray-300 font-normal",
        h1: "text-3xl text-white font-bold mt-6 mb-2",
        h2: "text-xl text-white font-semibold mt-4 mb-2",
        bullet: "text-base text-gray-300 list-item ml-4",
        quote: "text-lg text-gray-400 italic border-l-4 border-accent pl-4 py-1"
    }

    return (
        <div className="group flex items-start gap-2 py-1 relative hover:bg-white/[0.02] -mx-4 px-4 rounded-lg transition-colors">

            {/* Block Controls (Visible on Hover) */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 absolute -left-20 top-1.5 transition-opacity">
                <div className="flex bg-white/10 rounded-md overflow-hidden">
                    <button onClick={() => onTypeChange(id, "text")} className={`p-1.5 hover:bg-white/10 ${block.type === 'text' ? 'text-accent' : 'text-gray-400'}`}><Type size={14} /></button>
                    <button onClick={() => onTypeChange(id, "h1")} className={`p-1.5 hover:bg-white/10 ${block.type === 'h1' ? 'text-accent' : 'text-gray-400'}`}><Heading1 size={14} /></button>
                    <button onClick={() => onTypeChange(id, "h2")} className={`p-1.5 hover:bg-white/10 ${block.type === 'h2' ? 'text-accent' : 'text-gray-400'}`}><Heading2 size={14} /></button>
                    <button onClick={() => onTypeChange(id, "bullet")} className={`p-1.5 hover:bg-white/10 ${block.type === 'bullet' ? 'text-accent' : 'text-gray-400'}`}><List size={14} /></button>
                    <button onClick={() => onTypeChange(id, "quote")} className={`p-1.5 hover:bg-white/10 ${block.type === 'quote' ? 'text-accent' : 'text-gray-400'}`}><Quote size={14} /></button>
                </div>
                <button className="p-1.5 text-gray-600 hover:text-gray-300 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} />
                </button>
            </div>

            {block.type === 'bullet' && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}

            <textarea
                ref={textareaRef}
                rows={1}
                value={block.content}
                onChange={(e) => onUpdate(id, e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={block.type === 'h1' ? 'Heading 1' : "Type '/' for commands..."}
                className={`w-full bg-transparent resize-none focus:outline-none placeholder:text-white/10 ${styles[block.type]}`}
            />
        </div>
    )
}
