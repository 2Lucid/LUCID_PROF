import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const fs = require('fs');
const path = require('path');

export async function POST(req: Request) {
    try {
        const { prompt, type, count, difficulty, exerciseType } = await req.json()
        const cardCount = count || 10  // Default to 10 cards

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 })
        }


        const genAI = new GoogleGenerativeAI(apiKey)
        // User requested model: Gemini 2.0 Flash
        // User requested model: Gemini 2.0 Flash (default)

        let systemInstruction = ""

        if (type === 'quiz') {
            systemInstruction = `
            You are an educational content generator.
            Generate a quiz based on the user's prompt.
            Return ONLY valid JSON. No markdown formatting.
            Structure:
            {
                "title": "Creative Title",
                "description": "Short description",
                "questions": [
                    {
                        "questionText": "Question?",
                        "options": [
                            { "text": "Option A", "isCorrect": false },
                            { "text": "Option B", "isCorrect": true }
                        ]
                    }
                ]
            }
            Generate at least 5 questions.
            `
        } else if (type === 'course') {
            systemInstruction = `
            You are an educational content generator.
            Generate a course structure based on the user's prompt.
            Return ONLY valid JSON. No markdown formatting.
            Structure:
            {
                "title": "Creative Title",
                "description": "Short description",
                "content": [
                    { "type": "h1", "content": "Main Topic" },
                    { "type": "p", "content": "Introduction text..." },
                    { "type": "h2", "content": "Subtopic" },
                    { "type": "bullet", "content": "Point 1" },
                    { "type": "bullet", "content": "Point 2" }
                ]
            }
            `
        } else if (type === 'flashcards') {
            systemInstruction = `
            You are an educational content generator.
            Generate EXACTLY ${cardCount} flashcards based on the user's prompt.
            Return ONLY valid JSON. No markdown formatting.
            Structure:
            {
                "title": "Creative Title",
                "description": "Short description",
                "cards": [
                    { "front": "Term or Question", "back": "Definition or Answer" },
                    { "front": "Term", "back": "Definition" }
                ]
            }
            Make sure to generate exactly ${cardCount} cards.
            `
        } else if (type === 'exercises') {
            const exerciseCount = count || 5
            const diffLevel = difficulty || 'Intermediate'
            const exType = exerciseType || 'Open Ended'
            systemInstruction = `
            You are an educational content generator.
            Generate EXACTLY ${exerciseCount} ${exType} exercises at ${diffLevel} level.
            Return ONLY valid JSON. No markdown formatting.
            Structure:
            {
                "title": "Creative Exercise Set Title",
                "exercises": [
                    { "question": "Problem statement or question", "answer": "Detailed solution or answer", "hint": "Optional helpful hint" }
                ]
            }
            Make questions challenging but appropriate for the difficulty level.
            Provide complete solutions/answers. Include helpful hints when beneficial.
            `
        }

        // Models available on this API key (in order of preference)
        const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite"]

        async function generateWithFallback(modelIndex = 0): Promise<any> {
            if (modelIndex >= modelsToTry.length) {
                throw new Error("All AI models are currently exhausted. Please wait a few minutes and try again.")
            }

            const currentModel = modelsToTry[modelIndex]
            try {
                console.log(`Trying model: ${currentModel}`)
                const model = genAI.getGenerativeModel({ model: currentModel })
                const result = await model.generateContent(systemInstruction + "\n\nUser Prompt: " + prompt)
                return result
            } catch (error: any) {
                if (error.message?.includes('429') || error.status === 429) {
                    console.log(`Model ${currentModel} exhausted. Trying next model...`)
                    return generateWithFallback(modelIndex + 1)
                }
                throw error
            }
        }

        const result = await generateWithFallback()
        const response = result.response
        let text = response.text()

        // Cleanup markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()

        const data = JSON.parse(text)

        return NextResponse.json(data)

    } catch (error: any) {
        console.error("AI Generation Error:", error)

        // Check for Rate Limit / Quota (even after fallback)
        if (error.message?.includes('429') || error.status === 429) {
            return NextResponse.json(
                { error: "AI Service busy. Please try again in a few seconds." },
                { status: 429 }
            )
        }

        // Log to file for debugging
        try {
            // Basic logging
        } catch (logErr) {
            // ignore
        }

        return NextResponse.json({ error: "Failed to generate content", details: error.message }, { status: 500 })
    }
}
