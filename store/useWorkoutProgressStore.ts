import { create } from 'zustand/react'
import { ActiveWorkoutDraft, ExerciseProgressLog, ExerciseProgressLogDetails, WorkoutProgressSession } from '@/store/types'

export const DEFAULT_REST_TIMER_SECONDS = 90

const updateCurrentExerciseRestTime = (
    state: Pick<WorkoutProgressStore, 'currentExerciseId' | 'exerciseData'>,
    restTime: number
) => state.exerciseData.map((exercise) => {
    if (exercise.exerciseId !== state.currentExerciseId) return exercise

    return { ...exercise, restTime }
})

const getCurrentExerciseRestTime = (
    state: Pick<WorkoutProgressStore, 'currentExerciseId' | 'exerciseData'>
) => {
    const exercise = state.exerciseData.find((item) => item.exerciseId === state.currentExerciseId)

    return exercise?.restTime ?? DEFAULT_REST_TIMER_SECONDS
}

interface WorkoutProgressStore {
    workoutId?: number
    workoutTitle?: string
    startedAt?: Date
    setWorkoutDetails: (workoutId?: number, workoutTitle?: string) => void

    exerciseData: ExerciseProgressLog[]
    setExerciseData: (exerciseData: ExerciseProgressLog[]) => void
    getSession: () => WorkoutProgressSession | undefined
    hydrateSession: (draft: ActiveWorkoutDraft) => void
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

    restTimerRemainingSeconds: number
    isRestTimerRunning: boolean
    hasRestTimerStarted: boolean
    startRestTimer: () => void
    pauseRestTimer: () => void
    resumeRestTimer: () => void
    resetRestTimer: () => void
    adjustRestTimer: (secondsDelta: number) => void
    tickRestTimer: () => void
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
    setCurrentExerciseId: (exerciseId) => set((state) => ({
        currentExerciseId: exerciseId,
        currentExerciseDetails: state.currentExerciseId === exerciseId
            ? state.currentExerciseDetails
            : []
    })),

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

    hydrateSession: (draft) => set({
        workoutId: draft.workoutId,
        workoutTitle: draft.workoutTitle ?? undefined,
        startedAt: draft.startedAt,
        exerciseData: draft.exerciseData,
        currentExerciseId: draft.currentExerciseId ?? undefined,
        currentExerciseDetails: draft.currentExerciseDetails,
        restTimerRemainingSeconds: 0,
        isRestTimerRunning: false,
        hasRestTimerStarted: false
    }),

    resetSession: () => set({
        workoutId: undefined,
        workoutTitle: undefined,
        startedAt: undefined,
        exerciseData: [],
        currentExerciseId: undefined,
        currentExerciseDetails: [],
        restTimerRemainingSeconds: 0,
        isRestTimerRunning: false,
        hasRestTimerStarted: false
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
            currentExerciseDetails: currentExercise && currentExercise.details.length > 0
                ? currentExercise.details
                : state.currentExerciseDetails.length > 0
                    ? state.currentExerciseDetails
                    : exerciseDetails
        };
    }),

    setCompleted: (setIndex: number) =>
        set((state) => {
            let shouldStartRestTimer = false
            const currentExerciseDetails = state.currentExerciseDetails.map((details) => {
                if (details.set !== setIndex) return details

                shouldStartRestTimer = !details.isCompleted

                return { ...details, isCompleted: !details.isCompleted }
            })

            if (!shouldStartRestTimer) {
                return { currentExerciseDetails }
            }

            const restTime = getCurrentExerciseRestTime(state)

            return {
                currentExerciseDetails,
                exerciseData: updateCurrentExerciseRestTime(state, restTime),
                restTimerRemainingSeconds: restTime,
                isRestTimerRunning: restTime > 0,
                hasRestTimerStarted: true
            }
        }),
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
    })),

    restTimerRemainingSeconds: 0,
    isRestTimerRunning: false,
    hasRestTimerStarted: false,
    startRestTimer: () => set((state) => {
        const restTime = getCurrentExerciseRestTime(state)

        return {
            exerciseData: updateCurrentExerciseRestTime(state, restTime),
            restTimerRemainingSeconds: restTime,
            isRestTimerRunning: restTime > 0,
            hasRestTimerStarted: true
        }
    }),
    pauseRestTimer: () => set({ isRestTimerRunning: false }),
    resumeRestTimer: () => set((state) => {
        const restTime = getCurrentExerciseRestTime(state)
        const restTimerRemainingSeconds = state.restTimerRemainingSeconds > 0
            ? state.restTimerRemainingSeconds
            : restTime

        return {
            restTimerRemainingSeconds,
            isRestTimerRunning: restTimerRemainingSeconds > 0,
            hasRestTimerStarted: true
        }
    }),
    resetRestTimer: () => set((state) => {
        const restTime = getCurrentExerciseRestTime(state)

        return {
            restTimerRemainingSeconds: restTime,
            isRestTimerRunning: false,
            hasRestTimerStarted: false
        }
    }),
    adjustRestTimer: (secondsDelta) => set((state) => {
        const currentRestTime = getCurrentExerciseRestTime(state)
        const nextRestTime = Math.max(0, currentRestTime + secondsDelta)
        const nextRemainingSeconds = Math.max(0, state.restTimerRemainingSeconds + secondsDelta)

        return {
            exerciseData: updateCurrentExerciseRestTime(state, nextRestTime),
            restTimerRemainingSeconds: state.hasRestTimerStarted ? nextRemainingSeconds : nextRestTime,
            isRestTimerRunning: state.isRestTimerRunning && nextRemainingSeconds > 0,
            hasRestTimerStarted: state.hasRestTimerStarted
        }
    }),
    tickRestTimer: () => set((state) => {
        if (!state.isRestTimerRunning) return {}

        const restTimerRemainingSeconds = Math.max(0, state.restTimerRemainingSeconds - 1)

        return {
            restTimerRemainingSeconds,
            isRestTimerRunning: restTimerRemainingSeconds > 0
        }
    })
}))
