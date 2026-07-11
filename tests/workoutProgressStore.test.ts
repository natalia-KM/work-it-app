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

    it('confirms current exercise edits without marking it completed', () => {
        const store = useWorkoutProgressStore.getState()

        store.setWorkoutDetails(12, 'Push')
        store.setExerciseData([{ exerciseId: 3, details: [], restTime: 0 }])
        store.setCurrentExerciseId(3)
        store.addSet(10, 25)
        store.confirmCurrentExercise()

        const exercise = useWorkoutProgressStore.getState().exerciseData[0]

        expect(exercise.completed).toBeUndefined()
        expect(exercise.details).toEqual([{ set: 1, reps: 10, weight: 25, isCompleted: false }])
    })

    it('tracks skipped exercises and counts them as session data', () => {
        const store = useWorkoutProgressStore.getState()

        store.setWorkoutDetails(12, 'Push')
        store.setExerciseData([{ exerciseId: 3, details: [], restTime: 0, isOptional: true }])
        store.setCurrentExerciseId(3)
        store.skipCurrentExercise()

        const state = useWorkoutProgressStore.getState()

        expect(state.exerciseData[0].skipped).toBe(true)
        expect(state.exerciseData[0].completed).toBe(false)
        expect(state.hasSessionData()).toBe(true)
    })

    it('updates notes for the selected exercise only', () => {
        const store = useWorkoutProgressStore.getState()

        store.setWorkoutDetails(12, 'Push')
        store.setExerciseData([
            { exerciseId: 3, details: [], restTime: 0 },
            { exerciseId: 4, details: [], restTime: 0, notes: 'Keep elbows tucked' }
        ])
        store.setCurrentExerciseId(3)
        store.setCurrentExerciseNotes('Seat at 4')

        const state = useWorkoutProgressStore.getState()

        expect(state.exerciseData[0].notes).toBe('Seat at 4')
        expect(state.exerciseData[1].notes).toBe('Keep elbows tucked')
    })

    it('reuses saved exercise details when revisiting an exercise', () => {
        const store = useWorkoutProgressStore.getState()

        store.setWorkoutDetails(12, 'Push')
        store.setExerciseData([{
            exerciseId: 3,
            details: [{ set: 1, reps: 8, weight: 40, isCompleted: true }],
            restTime: 0
        }])
        store.setCurrentExerciseId(3)
        store.setCurrentExerciseDetails([{ set: 1, reps: 0, weight: 0 }])

        expect(useWorkoutProgressStore.getState().currentExerciseDetails).toEqual([
            { set: 1, reps: 8, weight: 40, isCompleted: true }
        ])
    })

    it('hydrates an active workout draft into a finish-ready session', () => {
        const startedAt = new Date('2026-07-10T12:00:00.000Z')
        const updatedAt = new Date('2026-07-10T12:05:00.000Z')
        const store = useWorkoutProgressStore.getState()

        store.hydrateSession({
            id: 1,
            workoutId: 12,
            workoutTitle: 'Push',
            startedAt,
            exerciseData: [{
                exerciseId: 3,
                details: [{ set: 1, reps: 8, weight: 40, isCompleted: true }],
                restTime: 0,
                completed: true
            }],
            currentExerciseId: 3,
            currentExerciseDetails: [{ set: 1, reps: 8, weight: 40, isCompleted: true }],
            updatedAt
        })

        const state = useWorkoutProgressStore.getState()
        const session = state.getSession()

        expect(state.workoutId).toBe(12)
        expect(state.workoutTitle).toBe('Push')
        expect(state.startedAt).toBe(startedAt)
        expect(state.currentExerciseId).toBe(3)
        expect(session).toEqual({
            workoutId: 12,
            startedAt,
            exercises: state.exerciseData
        })
    })

    it('keeps hydrated current exercise edits when reopening the same exercise', () => {
        const store = useWorkoutProgressStore.getState()

        store.hydrateSession({
            id: 1,
            workoutId: 12,
            workoutTitle: 'Push',
            startedAt: new Date('2026-07-10T12:00:00.000Z'),
            exerciseData: [{ exerciseId: 3, details: [], restTime: 0 }],
            currentExerciseId: 3,
            currentExerciseDetails: [{ set: 1, reps: 6, weight: 45, isCompleted: false }],
            updatedAt: new Date('2026-07-10T12:05:00.000Z')
        })

        store.setCurrentExerciseId(3)
        store.setCurrentExerciseDetails([{ set: 1, reps: 0, weight: 0 }])

        expect(useWorkoutProgressStore.getState().currentExerciseDetails).toEqual([
            { set: 1, reps: 6, weight: 45, isCompleted: false }
        ])
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
