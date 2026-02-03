"use client"

import { useState, Suspense } from "react"
import { ArrowLeft, Save, Sparkles, RefreshCw, PenTool, Wand2, Plus, Trash2, GripVertical, Check, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"
import { useSearchParams } from "next/navigation"
import { SUBJECTS, Subject } from "@/lib/constants/subjects"

// Exercise Types with Templates
const EXERCISE_TYPES = [
    {
        id: 'fill_blank',
        name: 'Texte à trous',
        icon: '📝',
        description: 'Remplir les espaces vides',
        template: { text: '', blanks: [''] }
    },
    {
        id: 'multiple_choice',
        name: 'QCM',
        icon: '🔘',
        description: 'Choix multiples',
        template: { question: '', options: [{ text: '', isCorrect: false }] }
    },
    {
        id: 'true_false',
        name: 'Vrai ou Faux',
        icon: '✓✗',
        description: 'Questions vrai/faux',
        template: { statement: '', isTrue: true }
    },
    {
        id: 'matching',
        name: 'Association',
        icon: '🔗',
        description: 'Relier les éléments',
        template: { pairs: [{ left: '', right: '' }] }
    },
    {
        id: 'ordering',
        name: 'Ordre',
        icon: '📋',
        description: 'Remettre dans l\'ordre',
        template: { items: [''], correctOrder: [0] }
    },
    {
        id: 'open_ended',
        name: 'Réponse libre',
        icon: '💬',
        description: 'Question ouverte',
        template: { question: '', modelAnswer: '', hint: '' }
    },
    {
        id: 'calculation',
        name: 'Calcul',
        icon: '🧮',
        description: 'Problème mathématique',
        template: { problem: '', answer: '', unit: '', steps: '' }
    }
]

interface Exercise {
    id: string
    type: string
    data: any
}

function ExerciseGenerator() {
    const searchParams = useSearchParams()
    const { user } = useAuth()

    const [mode, setMode] = useState<'manual' | 'ai'>('manual')
    const [title, setTitle] = useState("")
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [config, setConfig] = useState({
        topic: "",
        subject: "" as Subject | "",
        category: "",
        difficulty: "Intermediate",
        exerciseType: "Open Ended",
        count: 5
    })

    const [exercises, setExercises] = useState<Exercise[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

    // Add exercise from template
    const addExercise = (typeId: string) => {
        const typeInfo = EXERCISE_TYPES.find(t => t.id === typeId)
        if (!typeInfo) return

        const newExercise: Exercise = {
            id: generateId(),
            type: typeId,
            data: JSON.parse(JSON.stringify(typeInfo.template))
        }
        setExercises([...exercises, newExercise])
        setSelectedType(null)
    }

    const updateExercise = (id: string, data: any) => {
        setExercises(exercises.map(ex => ex.id === id ? { ...ex, data } : ex))
    }

    const removeExercise = (id: string) => {
        setExercises(exercises.filter(ex => ex.id !== id))
    }

    // AI mode: Generate with Gemini
    const handleAIGenerate = async () => {
        if (!config.topic) return

        setIsGenerating(true)
        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Generate ${config.count} ${config.exerciseType} exercises about "${config.topic}" at ${config.difficulty} level`,
                    type: 'exercises',
                    count: config.count,
                    difficulty: config.difficulty,
                    exerciseType: config.exerciseType
                })
            })

            if (!response.ok) throw new Error('Failed to generate')

            const data = await response.json()

            if (data.title) setTitle(data.title)

            if (data.exercises && Array.isArray(data.exercises)) {
                const newExercises = data.exercises.map((ex: any) => ({
                    id: generateId(),
                    type: 'open_ended',
                    data: {
                        question: ex.question || ex.problem || "",
                        modelAnswer: ex.answer || ex.solution || "",
                        hint: ex.hint || ""
                    }
                }))
                setExercises(newExercises)
            }
        } catch (error: any) {
            console.error(error)
            alert("Error generating exercises: " + error.message)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSave = async () => {
        if (!user) {
            alert("You must be logged in to save.")
            return
        }
        if (exercises.length === 0) {
            alert("Ajoutez au moins un exercice.")
            return
        }

        setIsSaving(true)
        try {
            const { error } = await supabase.from('exercises').insert({
                title: title || `Exercices - ${config.subject || 'Général'}`,
                created_by: user.id,
                content: exercises,
                subject: config.subject,
                category: config.category,
                status: 'published',
                is_public: true
            })

            if (error) throw error
            alert("Exercices sauvegardés !")
            setExercises([])
            setTitle("")
        } catch (err: any) {
            console.error(err)
            alert(`Erreur: ${err.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    // Render exercise editor based on type
    const renderExerciseEditor = (exercise: Exercise) => {
        const typeInfo = EXERCISE_TYPES.find(t => t.id === exercise.type)

        switch (exercise.type) {
            case 'fill_blank':
                return (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Texte (utilisez ___ pour les trous)</label>
                            <textarea
                                value={exercise.data.text}
                                onChange={(e) => updateExercise(exercise.id, { ...exercise.data, text: e.target.value })}
                                placeholder="La ___ est la capitale de la France."
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Réponses (séparées par des virgules)</label>
                            <input
                                value={exercise.data.blanks.join(', ')}
                                onChange={(e) => updateExercise(exercise.id, { ...exercise.data, blanks: e.target.value.split(',').map((s: string) => s.trim()) })}
                                placeholder="Paris"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>
                )

            case 'multiple_choice':
                return (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Question</label>
                            <input
                                value={exercise.data.question}
                                onChange={(e) => updateExercise(exercise.id, { ...exercise.data, question: e.target.value })}
                                placeholder="Quelle est la capitale de la France ?"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Options (cliquez pour marquer la bonne réponse)</label>
                            <div className="space-y-2">
                                {exercise.data.options.map((opt: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const newOptions = exercise.data.options.map((o: any, i: number) => ({ ...o, isCorrect: i === idx }))
                                                updateExercise(exercise.id, { ...exercise.data, options: newOptions })
                                            }}
                                            className={`p-1.5 rounded ${opt.isCorrect ? 'bg-green-500/30 text-green-400' : 'bg-white/10 text-gray-500'}`}
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <input
                                            value={opt.text}
                                            onChange={(e) => {
                                                const newOptions = [...exercise.data.options]
                                                newOptions[idx] = { ...opt, text: e.target.value }
                                                updateExercise(exercise.id, { ...exercise.data, options: newOptions })
                                            }}
                                            placeholder={`Option ${idx + 1}`}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                                        />
                                        {exercise.data.options.length > 1 && (
                                            <button
                                                onClick={() => {
                                                    const newOptions = exercise.data.options.filter((_: any, i: number) => i !== idx)
                                                    updateExercise(exercise.id, { ...exercise.data, options: newOptions })
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-red-400"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newOptions = [...exercise.data.options, { text: '', isCorrect: false }]
                                        updateExercise(exercise.id, { ...exercise.data, options: newOptions })
                                    }}
                                    className="text-sm text-emerald-400 hover:text-emerald-300"
                                >
                                    + Ajouter une option
                                </button>
                            </div>
                        </div>
                    </div>
                )

            case 'true_false':
                return (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Affirmation</label>
                            <input
                                value={exercise.data.statement}
                                onChange={(e) => updateExercise(exercise.id, { ...exercise.data, statement: e.target.value })}
                                placeholder="Paris est la capitale de la France."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => updateExercise(exercise.id, { ...exercise.data, isTrue: true })}
                                className={`flex-1 py-2 rounded-lg font-medium ${exercise.data.isTrue ? 'bg-green-500/30 text-green-400 border border-green-500/50' : 'bg-white/5 text-gray-400'}`}
                            >
                                ✓ Vrai
                            </button>
                            <button
                                onClick={() => updateExercise(exercise.id, { ...exercise.data, isTrue: false })}
                                className={`flex-1 py-2 rounded-lg font-medium ${!exercise.data.isTrue ? 'bg-red-500/30 text-red-400 border border-red-500/50' : 'bg-white/5 text-gray-400'}`}
                            >
                                ✗ Faux
                            </button>
                        </div>
                    </div>
                )

            case 'matching':
                return (
                    <div className="space-y-3">
                        <label className="text-xs text-gray-400 mb-1 block">Paires à associer</label>
                        {exercise.data.pairs.map((pair: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input
                                    value={pair.left}
                                    onChange={(e) => {
                                        const newPairs = [...exercise.data.pairs]
                                        newPairs[idx] = { ...pair, left: e.target.value }
                                        updateExercise(exercise.id, { ...exercise.data, pairs: newPairs })
                                    }}
                                    placeholder="Gauche"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                />
                                <span className="text-gray-500">↔</span>
                                <input
                                    value={pair.right}
                                    onChange={(e) => {
                                        const newPairs = [...exercise.data.pairs]
                                        newPairs[idx] = { ...pair, right: e.target.value }
                                        updateExercise(exercise.id, { ...exercise.data, pairs: newPairs })
                                    }}
                                    placeholder="Droite"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                />
                                {exercise.data.pairs.length > 1 && (
                                    <button
                                        onClick={() => {
                                            const newPairs = exercise.data.pairs.filter((_: any, i: number) => i !== idx)
                                            updateExercise(exercise.id, { ...exercise.data, pairs: newPairs })
                                        }}
                                        className="p-1.5 text-gray-500 hover:text-red-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const newPairs = [...exercise.data.pairs, { left: '', right: '' }]
                                updateExercise(exercise.id, { ...exercise.data, pairs: newPairs })
                            }}
                            className="text-sm text-emerald-400 hover:text-emerald-300"
                        >
                            + Ajouter une paire
                        </button>
                    </div>
                )

            case 'ordering':
                return (
                    <div className="space-y-3">
                        <label className="text-xs text-gray-400 mb-1 block">Éléments dans l'ordre correct</label>
                        {exercise.data.items.map((item: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                                <input
                                    value={item}
                                    onChange={(e) => {
                                        const newItems = [...exercise.data.items]
                                        newItems[idx] = e.target.value
                                        updateExercise(exercise.id, { ...exercise.data, items: newItems })
                                    }}
                                    placeholder={`Élément ${idx + 1}`}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                />
                                {exercise.data.items.length > 1 && (
                                    <button
                                        onClick={() => {
                                            const newItems = exercise.data.items.filter((_: any, i: number) => i !== idx)
                                            updateExercise(exercise.id, { ...exercise.data, items: newItems })
                                        }}
                                        className="p-1.5 text-gray-500 hover:text-red-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const newItems = [...exercise.data.items, '']
                                updateExercise(exercise.id, { ...exercise.data, items: newItems })
                            }}
                            className="text-sm text-emerald-400 hover:text-emerald-300"
                        >
                            + Ajouter un élément
                        </button>
                    </div>
                )

            case 'calculation':
                return (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Énoncé du problème</label>
                            <textarea
                                value={exercise.data.problem}
                                onChange={(e) => updateExercise(exercise.id, { ...exercise.data, problem: e.target.value })}
                                placeholder="Calculer l'aire d'un rectangle de 5m sur 3m."
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Réponse</label>
                                <input
                                    value={exercise.data.answer}
                                    onChange={(e) => updateExercise(exercise.id, { ...exercise.data, answer: e.target.value })}
                                    placeholder="15"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Unité</label>
                                <input
                                    value={exercise.data.unit}
                                    onChange={(e) => updateExercise(exercise.id, { ...exercise.data, unit: e.target.value })}
                                    placeholder="m²"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Étapes de résolution</label>
                            <textarea
                                value={exercise.data.steps}
                                onChange={(e) => updateExercise(exercise.id, { ...exercise.data, steps: e.target.value })}
                                placeholder="Aire = longueur × largeur = 5 × 3 = 15 m²"
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                            />
                        </div>
                    </div>
                )

            case 'open_ended':
            default:
                return (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Question</label>
                            <textarea
                                value={exercise.data.question}
                                onChange={(e) => updateExercise(exercise.id, { ...exercise.data, question: e.target.value })}
                                placeholder="Expliquez le concept de..."
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Réponse modèle</label>
                            <textarea
                                value={exercise.data.modelAnswer}
                                onChange={(e) => updateExercise(exercise.id, { ...exercise.data, modelAnswer: e.target.value })}
                                placeholder="La réponse attendue est..."
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Indice (optionnel)</label>
                            <input
                                value={exercise.data.hint || ''}
                                onChange={(e) => updateExercise(exercise.id, { ...exercise.data, hint: e.target.value })}
                                placeholder="Pensez à..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                            />
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/studio" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white">Créateur d'exercices</h1>
                    <p className="text-gray-400 mt-1">Créez des exercices manuellement ou avec l'IA</p>
                </div>
                {exercises.length > 0 && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-medium hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> {isSaving ? "..." : "Sauvegarder"}
                    </button>
                )}
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setMode('manual')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${mode === 'manual'
                            ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <PenTool className="w-5 h-5" />
                    Mode Manuel
                </button>
                <button
                    onClick={() => setMode('ai')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${mode === 'ai'
                            ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <Wand2 className="w-5 h-5" />
                    Mode IA
                </button>
            </div>

            {/* Title & Subject */}
            <div className="glass-card p-4 mb-6 space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre de l'exercice..."
                    className="w-full bg-transparent text-xl font-bold text-white placeholder:text-gray-500 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-4">
                    <select
                        value={config.subject}
                        onChange={(e) => setConfig({ ...config, subject: e.target.value as Subject, category: "" })}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 appearance-none"
                    >
                        <option value="" disabled>Matière</option>
                        {Object.keys(SUBJECTS).map((sub) => (
                            <option key={sub} value={sub} className="bg-gray-900">{sub}</option>
                        ))}
                    </select>
                    <select
                        value={config.category}
                        onChange={(e) => setConfig({ ...config, category: e.target.value })}
                        disabled={!config.subject}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 appearance-none disabled:opacity-50"
                    >
                        <option value="" disabled>Catégorie</option>
                        {config.subject && SUBJECTS[config.subject as Subject]?.map((cat) => (
                            <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* AI Mode Configuration */}
            {mode === 'ai' && (
                <div className="glass-card p-6 mb-6 space-y-4 border border-purple-500/30">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Configuration IA
                    </h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Sujet / Concept</label>
                        <input
                            type="text"
                            value={config.topic}
                            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                            placeholder="ex: Les dérivées, Les verbes irréguliers..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Difficulté</label>
                            <select
                                value={config.difficulty}
                                onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white appearance-none"
                            >
                                <option className="bg-gray-900">Débutant</option>
                                <option className="bg-gray-900">Intermédiaire</option>
                                <option className="bg-gray-900">Avancé</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Type</label>
                            <select
                                value={config.exerciseType}
                                onChange={(e) => setConfig({ ...config, exerciseType: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white appearance-none"
                            >
                                <option className="bg-gray-900">Question ouverte</option>
                                <option className="bg-gray-900">Texte à trous</option>
                                <option className="bg-gray-900">Vrai/Faux</option>
                                <option className="bg-gray-900">Problème</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Nombre</label>
                            <input
                                type="number"
                                value={config.count}
                                onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) || 5 })}
                                min={1}
                                max={20}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAIGenerate}
                        disabled={!config.topic || isGenerating}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <><RefreshCw className="w-5 h-5 animate-spin" /> Génération...</>
                        ) : (
                            <><Sparkles className="w-5 h-5" /> Générer avec l'IA</>
                        )}
                    </button>
                </div>
            )}

            {/* Manual Mode: Type Selector */}
            {mode === 'manual' && (
                <div className="mb-6">
                    {selectedType === null ? (
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Choisir un type d'exercice :</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {EXERCISE_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => addExercise(type.id)}
                                        className="glass-card p-4 text-center hover:bg-white/10 transition-colors group"
                                    >
                                        <span className="text-2xl">{type.icon}</span>
                                        <p className="text-sm font-medium text-white mt-2">{type.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {/* Exercises List */}
            <div className="space-y-4">
                {exercises.length > 0 && (
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Exercices ({exercises.length})</h2>
                        {mode === 'manual' && (
                            <button
                                onClick={() => setSelectedType(null)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium hover:bg-emerald-500/30"
                            >
                                <Plus className="w-4 h-4" /> Ajouter
                            </button>
                        )}
                    </div>
                )}

                {exercises.length === 0 && mode === 'ai' && (
                    <div className="h-[200px] flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                        <Sparkles className="w-8 h-8 mb-3 opacity-50" />
                        <p>Configurez l'IA ci-dessus et générez</p>
                    </div>
                )}

                {exercises.map((ex, i) => {
                    const typeInfo = EXERCISE_TYPES.find(t => t.id === ex.type)
                    return (
                        <div key={ex.id} className="glass-card p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{typeInfo?.icon}</span>
                                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                                        {typeInfo?.name} #{i + 1}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeExercise(ex.id)}
                                    className="p-1 text-gray-500 hover:text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {renderExerciseEditor(ex)}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default function ExerciseGeneratorPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>}>
            <ExerciseGenerator />
        </Suspense>
    )
}
