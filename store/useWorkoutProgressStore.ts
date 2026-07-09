import { create } from 'zustand/react'
import { ExerciseProgressLog, ExerciseProgressLogDetails } from '@/store/types'

interface WorkoutProgressStore {
    workoutId?: number
    workoutTitle?: string
    setWorkoutDetails: (workoutId?: number, workoutTitle?: string) => void

    exerciseData: ExerciseProgressLog[]
    setExerciseData: (exerciseData: ExerciseProgressLog[]) => void

    confirmCurrentExercise: () => void
    getExerciseDetails: (exerciseId?: number) => ExerciseProgressLogDetails[]

    currentExerciseId?: number
    setCurrentExerciseId: (exerciseId: number) => void
    currentExerciseDetails: ExerciseProgressLogDetails[]
    setCurrentExerciseDetails: (exerciseDetails: ExerciseProgressLogDetails[]) => void

    setCompleted: (setIndex: number) => void
    setReps: (setIndex: number, reps: number) => void
    setWeight: (setIndex: number, weight: number) => void
    addSet: (reps?: number, weight?: number) => void
}

export const useWorkoutProgressStore = create<WorkoutProgressStore>()((set, get) => ({
    workoutId: undefined,
    workoutTitle: undefined,
    setWorkoutDetails: (workoutId, workoutTitle) => set({ workoutId, workoutTitle }),

    currentExerciseId: undefined,
    setCurrentExerciseId: (exerciseId) => set({ currentExerciseId: exerciseId }),

    exerciseData: [],
    setExerciseData: (exerciseData) => set({ exerciseData }),

    confirmCurrentExercise: () => set((state) => ({
        exerciseData: state.exerciseData.map((exercise) => {
            if (exercise.exerciseId !== state.currentExerciseId) return exercise

            return { ...exercise, details: state.currentExerciseDetails }
        })
    })),

    getExerciseDetails: (exerciseId) => {
        const exercise = get().exerciseData.find(ex => ex.exerciseId === exerciseId)
        return exercise?.details ?? []
    },

    currentExerciseDetails: [],
    setCurrentExerciseDetails: (exerciseDetails) => set((state) => {
        const currentExercise = state.exerciseData.find(
            (ex) => ex.exerciseId === state.currentExerciseId
        );

        return {
            currentExerciseDetails:
                currentExercise && currentExercise.details.length > 0
                    ? currentExercise.details
                    : exerciseDetails
        };
    }),

    setCompleted: (setIndex: number) =>
        set((state) => ({
            currentExerciseDetails: state.currentExerciseDetails.map((details) => {
                return details.set === setIndex ? { ...details, isCompleted: !details.isCompleted } : details
            })
        })),
    setReps: (setIndex, reps) =>
        set((state) => ({
            currentExerciseDetails: state.currentExerciseDetails.map((details) => {
                return details.set === setIndex ? { ...details, reps } : details
            })
        })),
    setWeight: (setIndex, weight) =>
        set((state) => ({
            currentExerciseDetails: state.currentExerciseDetails.map((details) => {
                return details.set === setIndex ? { ...details, weight } : details
            })
        })),
    addSet: (reps, weight) => set((state) => ({
        currentExerciseDetails: [
            ...state.currentExerciseDetails,
            {
                set: state.currentExerciseDetails.length + 1,
                reps: reps ?? 0,
                weight: weight ?? 0,
                isCompleted: false
            }
        ]
    }))
}))