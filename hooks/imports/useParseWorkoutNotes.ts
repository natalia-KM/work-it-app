import { useMutation } from '@tanstack/react-query'
import { workoutNotesImportSchema } from '@/database/importTypes'

interface ParseWorkoutNotesInput {
    sourceName: string
    text: string
}

const getImportApiUrl = () => {
    return process.env.EXPO_PUBLIC_IMPORT_API_URL ?? 'http://localhost:8787'
}

export const useParseWorkoutNotes = () => {
    return useMutation({
        mutationFn: async ({ sourceName, text }: ParseWorkoutNotesInput) => {
            const response = await fetch(`${getImportApiUrl()}/api/import-workout-notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sourceName, text })
            })

            if (!response.ok) {
                const message = await response.text()
                throw new Error(message || 'Could not parse workout notes.')
            }

            const data = await response.json()
            return workoutNotesImportSchema.parse(data)
        }
    })
}

