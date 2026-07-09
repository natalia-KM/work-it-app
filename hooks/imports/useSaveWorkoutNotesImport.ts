import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/config/queryClient'
import { WorkoutNotesImport } from '@/database/importTypes'
import { useWorkoutImportService } from '@/database/services/useWorkoutImportService'

export const useSaveWorkoutNotesImport = () => {
    const { saveImport } = useWorkoutImportService()

    return useMutation({
        mutationFn: async (parsedImport: WorkoutNotesImport) => saveImport(parsedImport),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['workouts'] }),
                queryClient.invalidateQueries({ queryKey: ['workout'] }),
                queryClient.invalidateQueries({ queryKey: ['workout-exercises'] }),
                queryClient.invalidateQueries({ queryKey: ['recent-exercise-logs'] }),
                queryClient.invalidateQueries({ queryKey: ['workout-stats'] })
            ])
        }
    })
}
