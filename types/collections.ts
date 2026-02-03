export interface Collection {
    id: string
    title: string
    description?: string
    subject?: string
    is_public: boolean
    created_by: string
    created_at: string
}

export interface CollectionItem {
    id: string
    collection_id: string
    content_type: 'quiz' | 'course' | 'flashcards' | 'exercises'
    content_id: string
    position: number
    created_at: string
    // Joined data (optional)
    content?: {
        title: string
        subject?: string
        verification_status?: 'pending' | 'verified' | 'rejected'
    }
}
