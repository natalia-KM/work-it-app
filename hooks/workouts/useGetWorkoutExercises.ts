import { useQuery } from '@tanstack/react-query'
import { useWorkoutService } from '@/database/services/useWorkoutService'
import { ExerciseWorkoutDetails } from '@/database/entities'

interface GetWorkoutExercisesProps {
    workoutId?: number
    onSuccess?: (exercises: ExerciseWorkoutDetails[]) => void
}

export const useGetWorkoutExercises = ({
    workoutId,
    onSuccess
}: GetWorkoutExercisesProps) => {
    const { getWorkoutExercisesWithDetails } = useWorkoutService()

    const getWorkoutExercises = async () => {
        if (!workoutId) return

        const result = await getWorkoutExercisesWithDetails(workoutId)
        onSuccess?.(result)

        return result
    }
    return useQuery({
        queryKey: ['workout-exercises'],
        queryFn: getWorkoutExercises,
        refetchOnMount: 'always'
    })
}