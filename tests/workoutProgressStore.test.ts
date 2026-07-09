import { beforeEach, describe, expect, it } from 'vitest'
import { useWorkoutProgressStore } from '@/store/useWorkoutProgressStore'

describe('workout progress store', () => {
    beforeEach(() => {
        useWorkoutProgressStore.getState().resetSession()
    })

    it('starts a session and exposes finish-ready data', () => {
        const store = useWorkoutProgressStore.getState()

        store.setWorkoutDetails(12, 'Push')
        store.setExerciseData([{ exerciseId: 3, details: [], restTime: 0 }])

        const session = useWorkoutProgressStore.getState().getSession()

        expect(session?.workoutId).toBe(12)
        expect(session?.exercises).toHaveLength(1)
        expect(session?.startedAt).toBeInstanceOf(Date)
    })

    it('adds and edits set details for the current exercise', () => {
        const store = useWorkoutProgressStore.getState()

        store.setWorkoutDetails(12, 'Push')
        store.setExerciseData([{ exerciseId: 3, details: [], restTime: 0 }])
        store.setCurrentExerciseId(3)
        store.addSet()
        store.setReps(1, 8)
        store.setWeight(1, 40)
        store.setCompleted(1)
        store.completeCurrentExercise()

        const exercise = useWorkoutProgressStore.getState().exerciseData[0]

        expect(exercise.completed).toBe(true)
        expect(exercise.details).toEqual([{ set: 1, reps: 8, weight: 40, isCompleted: true }])
    })

    it('resets all session data after cancel or finish', () => {
        const store = useWorkoutProgressStore.getState()

        store.setWorkoutDetails(12, 'Push')
        store.setExerciseData([{ exerciseId: 3, details: [{ set: 1, reps: 8, weight: 40 }], restTime: 0 }])
        store.resetSession()

        const state = useWorkoutProgressStore.getState()

        expect(state.workoutId).toBeUndefined()
        expect(state.exerciseData).toEqual([])
        expect(state.getSession()).toBeUndefined()
    })
})
