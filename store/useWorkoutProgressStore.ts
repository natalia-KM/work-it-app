import { create } from 'zustand/react'
import { ExerciseProgressLog, ExerciseProgressLogDetails, WorkoutProgressSession } from '@/store/types'

interface WorkoutProgressStore {
    workoutId?: number
    workoutTitle?: string
    startedAt?: Date
    setWorkoutDetails: (workoutId?: number, workoutTitle?: string) => void

    exerciseData: ExerciseProgressLog[]
    setExerciseData: (exerciseData: ExerciseProgressLog[]) => void
    getSession: () => WorkoutProgressSession | undefined
    resetSession: () => void

    confirmCurrentExercise: () => void
    completeCurrentExercise: () => void
    skipCurrentExercise: () => void
    getExerciseDetails: (exerciseId?: number) => ExerciseProgressLogDetails[]
    hasSessionData: () => boolean

    currentExerciseId?: number
    setCurrentExerciseId: (exerciseId: number) => void
    currentExerciseDetails: ExerciseProgressLogDetails[]
    setCurrentExerciseDetails: (exerciseDetails: ExerciseProgressLogDetails[]) => void

    setCompleted: (setIndex: number) => void
    setReps: (setIndex: number, reps: number) => void
    setWeight: (setIndex: number, weight: number) => void
    setCurrentExerciseNotes: (notes: string) => void
    addSet: (reps?: number, weight?: number) => void
}

export const useWorkoutProgressStore = create<WorkoutProgressStore>()((set, get) => ({
    workoutId: undefined,
    workoutTitle: undefined,
    startedAt: undefined,
    setWorkoutDetails: (workoutId, workoutTitle) => set((state) => ({
        workoutId,
        workoutTitle: workoutTitle ?? state.workoutTitle,
        startedAt: state.startedAt ?? new Date()
    })),

    currentExerciseId: undefined,
    setCurrentExerciseId: (exerciseId) => set({
        currentExerciseId: exerciseId,
        currentExerciseDetails: []
    }),

    exerciseData: [],
    setExerciseData: (exerciseData) => set({ exerciseData }),

    getSession: () => {
        const { workoutId, startedAt, exerciseData } = get()

        if (!workoutId || !startedAt) return undefined

        return {
            workoutId,
            startedAt,
            exercises: exerciseData
        }
    },

    resetSession: () => set({
        workoutId: undefined,
        workoutTitle: undefined,
        startedAt: undefined,
        exerciseData: [],
        currentExerciseId: undefined,
        currentExerciseDetails: []
    }),

    confirmCurrentExercise: () => set((state) => ({
        exerciseData: state.exerciseData.map((exercise) => {
            if (exercise.exerciseId !== state.currentExerciseId) return exercise

            return { ...exercise, details: state.currentExerciseDetails }
        })
    })),

    completeCurrentExercise: () => set((state) => ({
        exerciseData: state.exerciseData.map((exercise) => {
            if (exercise.exerciseId !== state.currentExerciseId) return exercise

            return {
                ...exercise,
                completed: true,
                skipped: false,
                details: state.currentExerciseDetails
            }
        })
    })),

    skipCurrentExercise: () => set((state) => ({
        exerciseData: state.exerciseData.map((exercise) => {
            if (exercise.exerciseId !== state.currentExerciseId) return exercise

            return {
                ...exercise,
                completed: false,
                skipped: true,
                details: state.currentExerciseDetails
            }
        })
    })),

    getExerciseDetails: (exerciseId) => {
        const exercise = get().exerciseData.find(ex => ex.exerciseId === exerciseId)
        return exercise?.details ?? []
    },

    hasSessionData: () => {
        const { exerciseData, currentExerciseDetails } = get()
        return exerciseData.some(exercise => exercise.details.length > 0 || exercise.completed || exercise.skipped)
            || currentExerciseDetails.length > 0
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
    setCurrentExerciseNotes: (notes) =>
        set((state) => ({
            exerciseData: state.exerciseData.map((exercise) => {
                if (exercise.exerciseId !== state.currentExerciseId) return exercise

                return { ...exercise, notes }
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
