import { describe, expect, it } from 'vitest'
import {
    buildExerciseHistory,
    ExerciseHistorySourceRow
} from '@/database/exerciseHistory'

const row = (overrides: Partial<ExerciseHistorySourceRow>): ExerciseHistorySourceRow => ({
    workoutLogId: 1,
    workoutId: 10,
    workoutTitle: 'Push',
    date: new Date('2026-07-10T09:00:00'),
    duration: 3600,
    exerciseLogId: 100,
    details: [{ set: 1, reps: 10, weight: 80 }],
    notes: null,
    restTime: 90,
    bestAchieved: 800,
    ...overrides
})

describe('exercise history mapping', () => {
    it('maps completed exercise log rows with notes and total volume', () => {
        const history = buildExerciseHistory([
            row({
                notes: 'Felt strong',
                details: [
                    { set: 1, reps: 10, weight: 80 },
                    { set: 2, reps: 8, weight: 90 }
                ]
            })
        ])

        expect(history).toEqual([
            expect.objectContaining({
                workoutLogId: 1,
                workoutId: 10,
                workoutTitle: 'Push',
                exerciseLogId: 100,
                notes: 'Felt strong',
                restTime: 90,
                bestAchieved: 800,
                totalVolume: 1520,
                details: [
                    { set: 1, reps: 10, weight: 80, volume: 800 },
                    { set: 2, reps: 8, weight: 90, volume: 720 }
                ]
            })
        ])
    })

    it('handles string, null, and malformed details without crashing', () => {
        expect(buildExerciseHistory([
            row({ details: '[{"set":1,"reps":5,"weight":100}]' })
        ])[0].details).toEqual([
            { set: 1, reps: 5, weight: 100, volume: 500 }
        ])

        expect(buildExerciseHistory([row({ details: null })])[0].details).toEqual([])
        expect(buildExerciseHistory([row({ details: 'not-json' })])[0].details).toEqual([])
    })

    it('preserves service-provided newest-first order', () => {
        const history = buildExerciseHistory([
            row({ workoutLogId: 3, exerciseLogId: 300, date: new Date('2026-07-10T09:00:00') }),
            row({ workoutLogId: 2, exerciseLogId: 200, date: new Date('2026-07-09T09:00:00') }),
            row({ workoutLogId: 1, exerciseLogId: 100, date: new Date('2026-07-08T09:00:00') })
        ])

        expect(history.map((item) => item.workoutLogId)).toEqual([3, 2, 1])
    })
})
