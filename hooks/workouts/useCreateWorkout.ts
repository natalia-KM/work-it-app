import { useWorkoutService } from '@/database/services/useWorkoutService'
import { useMutation } from '@tanstack/react-query'
import { WorkoutFormValues } from '@/components/AddWorkoutForm/AddWorkoutValidationSchema'
import { Workout } from '@/database/entities'

export const useCreateWorkout = () => {
    const { addWorkout } = useWorkoutService()

    const createWorkout = async (data: WorkoutFormValues) => {
        const newWorkout: Omit<Workout, 'id' | 'createdAt'> = {
            ...data,
            lastWorkout: null
        }
        return await addWorkout(newWorkout)
    }

    return useMutation({
        mutationKey: ['createWorkout'],
        mutationFn: createWorkout
    })
}