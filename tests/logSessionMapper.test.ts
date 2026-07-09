import { describe, expect, it } from 'vitest'
import { getBestAchieved, getPersistableSets } from '@/database/services/logSessionMapper'

describe('log session mapping', () => {
    it('keeps completed or non-empty set rows for persistence', () => {
        const sets = getPersistableSets([
            { set: 1, reps: 0, weight: 0, isCompleted: false },
            { set: 2, reps: 10, weight: 0, isCompleted: false },
            { set: 3, reps: 0, weight: 20, isCompleted: false },
            { set: 4, reps: 0, weight: 0, isCompleted: true }
        ])

        expect(sets).toEqual([
            { set: 2, reps: 10, weight: 0 },
            { set: 3, reps: 0, weight: 20 },
            { set: 4, reps: 0, weight: 0 }
        ])
    })

    it('calculates best achieved from volume with reps as a fallback', () => {
        const bestAchieved = getBestAchieved({
            exerciseId: 1,
            restTime: 0,
            details: [
                { set: 1, reps: 12, weight: 0 },
                { set: 2, reps: 8, weight: 50 },
                { set: 3, reps: 5, weight: 70 }
            ]
        })

        expect(bestAchieved).toBe(400)
    })
})
