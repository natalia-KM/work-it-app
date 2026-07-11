import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_REST_TIMER_SECONDS, useWorkoutProgressStore } from '@/store/useWorkoutProgressStore'

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

    it('starts the rest timer when a set is marked complete', () => {
        const store = useWorkoutProgressStore.getState()

        store.setWorkoutDetails(12, 'Push')
        store.setExerciseData([{ exerciseId: 3, details: [], restTime: DEFAULT_REST_TIMER_SECONDS }])
        store.setCurrentExerciseId(3)
        store.addSet()
        store.setCompleted(1)

        const state = useWorkoutProgressStore.getState()
        const session = state.getSession()

        expect(state.currentExerciseDetails).toEqual([
            { set: 1, reps: 0, weight: 0, isCompleted: true }
        ])
        expect(state.restTimerRemainingSeconds).toBe(DEFAULT_REST_TIMER_SECONDS)
        expect(state.isRestTimerRunning).toBe(true)
        expect(state.hasRestTimerStarted).toBe(true)
        expect(session?.exercises[0].restTime).toBe(DEFAULT_REST_TIMER_SECONDS)
    })

    it('pauses, resumes, ticks, and resets the rest timer', () => {
        const store = useWorkoutProgressStore.getState()

        store.setWorkoutDetails(12, 'Push')
        store.setExerciseData([{ exerciseId: 3, details: [], restTime: DEFAULT_REST_TIMER_SECONDS }])
        store.setCurrentExerciseId(3)
        store.startRestTimer()
        store.pauseRestTimer()
        store.tickRestTimer()

        expect(useWorkoutProgressStore.getState().isRestTimerRunning).toBe(false)
        expect(useWorkoutProgressStore.getState().restTimerRemainingSeconds).toBe(DEFAULT_REST_TIMER_SECONDS)

        store.resumeRestTimer()
        store.tickRestTimer()

        expect(useWorkoutProgressStore.getState().isRestTimerRunning).toBe(true)
        expect(useWorkoutProgressStore.getState().restTimerRemainingSeconds).toBe(DEFAULT_REST_TIMER_SECONDS - 1)

        store.resetRestTimer()

        expect(useWorkoutProgressStore.getState().isRestTimerRunning).toBe(false)
        expect(useWorkoutProgressStore.getState().restTimerRemainingSeconds).toBe(DEFAULT_REST_TIMER_SECONDS)
        expect(useWorkoutProgressStore.getState().hasRestTimerStarted).toBe(false)
    })

    it('keeps an elapsed rest timer at zero until reset or restart', () => {
        const store = useWorkoutProgressStore.getState()

        store.setWorkoutDetails(12, 'Push')
        store.setExerciseData([{ exerciseId: 3, details: [], restTime: 1 }])
        store.setCurrentExerciseId(3)
        store.startRestTimer()
        store.tickRestTimer()

        const state = useWorkoutProgressStore.getState()

        expect(state.restTimerRemainingSeconds).toBe(0)
        expect(state.isRestTimerRunning).toBe(false)
        expect(state.hasRestTimerStarted).toBe(true)
    })

    it('adjusts the rest timer duration and clamps at zero seconds', () => {
        const store = useWorkoutProgressStore.getState()

        store.setWorkoutDetails(12, 'Push')
        store.setExerciseData([{ exerciseId: 3, details: [], restTime: DEFAULT_REST_TIMER_SECONDS }])
        store.setCurrentExerciseId(3)
        store.adjustRestTimer(-30)
        store.adjustRestTimer(-90)

        const state = useWorkoutProgressStore.getState()

        expect(state.exerciseData[0].restTime).toBe(0)
        expect(state.restTimerRemainingSeconds).toBe(0)
        expect(state.isRestTimerRunning).toBe(false)
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

    it('hydrates saved exercise rest time from an active workout draft', () => {
        const store = useWorkoutProgressStore.getState()

        store.hydrateSession({
            id: 1,
            workoutId: 12,
            workoutTitle: 'Push',
            startedAt: new Date('2026-07-10T12:00:00.000Z'),
            exerciseData: [{ exerciseId: 3, details: [], restTime: 75 }],
            currentExerciseId: 3,
            currentExerciseDetails: [],
            updatedAt: new Date('2026-07-10T12:05:00.000Z')
        })

        expect(useWorkoutProgressStore.getState().getSession()?.exercises[0].restTime).toBe(75)
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
