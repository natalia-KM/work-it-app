import { describe, expect, it } from 'vitest'
import {
    buildCompletedWorkoutHistory,
    buildCompletedWorkoutSession,
    CompletedWorkoutHistorySourceRow,
    getSafeExerciseSets
} from '@/database/logHistory'

const row = (overrides: Partial<CompletedWorkoutHistorySourceRow>): CompletedWorkoutHistorySourceRow => ({
    workoutLogId: 1,
    workoutId: 10,
    workoutTitle: 'Push',
    date: new Date('2026-07-10T09:00:00'),
    duration: 3600,
    exerciseLogId: 100,
    exerciseId: 20,
    exerciseTitle: 'Bench press',
    details: [{ set: 1, reps: 10, weight: 80 }],
    notes: null,
    restTime: 0,
    bestAchieved: 800,
    ...overrides
})

describe('completed workout history mapping', () => {
    it('combines exercise log rows into session history summaries', () => {
        const history = buildCompletedWorkoutHistory([
            row({
                workoutLogId: 1,
                exerciseLogId: 100,
                exerciseId: 20,
                details: [
                    { set: 1, reps: 10, weight: 80 },
                    { set: 2, reps: 8, weight: 90 }
                ]
            }),
            row({
                workoutLogId: 1,
                exerciseLogId: 101,
                exerciseId: 21,
                exerciseTitle: 'Shoulder press',
                details: [{ set: 1, reps: 8, weight: 40 }]
            })
        ])

        expect(history).toEqual([
            expect.objectContaining({
                workoutLogId: 1,
                workoutId: 10,
                workoutTitle: 'Push',
                duration: 3600,
                exerciseCount: 2,
                setCount: 3,
                totalVolume: 1840
            })
        ])
    })

    it('sorts session history newest first', () => {
        const history = buildCompletedWorkoutHistory([
            row({ workoutLogId: 1, date: new Date('2026-07-08T09:00:00') }),
            row({ workoutLogId: 3, date: new Date('2026-07-10T09:00:00') }),
            row({ workoutLogId: 2, date: new Date('2026-07-09T09:00:00') })
        ])

        expect(history.map((item) => item.workoutLogId)).toEqual([3, 2, 1])
    })

    it('builds a session detail with exercise rows and set volume', () => {
        const session = buildCompletedWorkoutSession([
            row({
                exerciseLogId: 100,
                exerciseId: 20,
                exerciseTitle: 'Bench press',
                notes: 'Felt strong',
                details: [{ set: 1, reps: 10, weight: 80 }]
            })
        ])

        expect(session).toMatchObject({
            workoutLogId: 1,
            totalVolume: 800,
            setCount: 1,
            exercises: [{
                exerciseLogId: 100,
                exerciseId: 20,
                exerciseTitle: 'Bench press',
                notes: 'Felt strong',
                totalVolume: 800,
                details: [{ set: 1, reps: 10, weight: 80, volume: 800 }]
            }]
        })
    })

    it('keeps empty completed sessions visible', () => {
        const history = buildCompletedWorkoutHistory([
            row({
                workoutLogId: 1,
                exerciseLogId: null,
                exerciseId: null,
                exerciseTitle: null,
                details: null
            })
        ])

        expect(history[0]).toMatchObject({
            workoutLogId: 1,
            exerciseCount: 0,
            setCount: 0,
            totalVolume: 0
        })
    })

    it('handles string, null, and malformed details without crashing', () => {
        expect(getSafeExerciseSets('[{"set":1,"reps":5,"weight":100}]')).toEqual([
            { set: 1, reps: 5, weight: 100, volume: 500 }
        ])
        expect(getSafeExerciseSets(null)).toEqual([])
        expect(getSafeExerciseSets('not-json')).toEqual([])
    })
})
