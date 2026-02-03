"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/providers/auth-provider"

type ContentType = 'quiz' | 'course' | 'flashcards' | 'exercises'

export function useRemix() {
    const { user } = useAuth()
    const router = useRouter()
    const [isRemixing, setIsRemixing] = useState(false)

    const remixContent = async (originalItem: any, type: ContentType) => {
        if (!user) return

        setIsRemixing(true)

        // Map type to table name
        const tableMap: Record<ContentType, string> = {
            'quiz': 'quizzes',
            'course': 'courses',
            'flashcards': 'flashcards',
            'exercises': 'exercises'
        }

        const tableName = tableMap[type]

        try {
            // Prepare new item
            const newItem = {
                ...originalItem,
                id: undefined, // Let DB generate new ID
                created_by: user.id,
                created_at: new Date().toISOString(),
                title: `Remix: ${originalItem.title}`,
                is_public: false, // Start as private draft
                // parent_id: originalItem.id // Future proofing if schema supports it
            }

            // Remove internal system fields if any (like updated_at) to cleaner copy
            delete newItem.updated_at

            // Insert into DB
            const { data, error } = await supabase
                .from(tableName)
                .insert(newItem)
                .select()
                .single()

            if (error) throw error

            // Redirect to Studio Editor
            // Note: Studio paths might match content type names (e.g. /studio/quiz, /studio/course)
            router.push(`/studio/${type}?id=${data.id}`)

        } catch (error) {
            console.error("Remix failed:", error)
            alert("Failed to remix content. Please try again.")
        } finally {
            setIsRemixing(false)
        }
    }

    return { remixContent, isRemixing }
}
