import { describe, expect, it } from 'vitest'
import { workoutNotesImportSchema } from '@/database/importTypes'
import { getImportedLogSource, getLogBestAchieved, getLogDetails } from '@/database/services/importWorkoutNotesMapper'

const parsedImport = {
    sourceName: 'Legs_260709_213817.txt',
    summary: 'Legs workout history',
    warnings: ['One ambiguous line was skipped.'],
    workouts: [
        {
            title: 'Legs',
            notes: null,
            exercises: [
                {
                    title: 'Hip thrusts',
                    instructions: 'Keep hips moving in a straight line.',
                    notes: 'Use the cover when available.',
                    isOptional: false,
                    sortOrder: 1,
                    targetSets: 3,
                    targetReps: 12,
                    targetWeight: 60,
                    logs: [
                        {
                            date: '2026-04-17',
                            notes: 'Good session.',
                            sets: [
                                { set: 1, weight: 60, reps: 12, notes: null },
                                { set: 2, weight: 65, reps: 12, notes: null },
                                { set: 3, weight: 70, reps: 11, notes: null }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}

describe('workout notes import', () => {
    it('validates the structured AI import contract', () => {
        expect(workoutNotesImportSchema.parse(parsedImport)).toEqual(parsedImport)
    })

    it('defaults optional import arrays and flags for app-created data', () => {
        const result = workoutNotesImportSchema.parse({
            sourceName: 'Upper.txt',
            workouts: [{
                title: 'Upper body',
                exercises: [{
                    title: 'Assisted chin ups',
                    sortOrder: 0
                }]
            }]
        })

        expect(result.warnings).toEqual([])
        expect(result.workouts[0].exercises[0].isOptional).toBe(false)
        expect(result.workouts[0].exercises[0].logs).toEqual([])
    })

    it('rejects invalid dates and empty set history', () => {
        const result = workoutNotesImportSchema.safeParse({
            ...parsedImport,
            workouts: [{
                ...parsedImport.workouts[0],
                exercises: [{
                    ...parsedImport.workouts[0].exercises[0],
                    logs: [{
                        date: '17/04/2026',
                        notes: null,
                        sets: []
                    }]
                }]
            }]
        })

        expect(result.success).toBe(false)
    })

    it('rejects negative weights and reps', () => {
        const result = workoutNotesImportSchema.safeParse({
            ...parsedImport,
            workouts: [{
                ...parsedImport.workouts[0],
                exercises: [{
                    ...parsedImport.workouts[0].exercises[0],
                    logs: [{
                        date: '2026-04-17',
                        notes: null,
                        sets: [{ set: 1, weight: -1, reps: -2, notes: null }]
                    }]
                }]
            }]
        })

        expect(result.success).toBe(false)
    })

    it('normalizes imported log helpers for persistence', () => {
        const log = parsedImport.workouts[0].exercises[0].logs[0]

        expect(getLogDetails(log)).toEqual([
            { set: 1, weight: 60, reps: 12 },
            { set: 2, weight: 65, reps: 12 },
            { set: 3, weight: 70, reps: 11 }
        ])
        expect(getLogBestAchieved(log)).toBe(780)
        expect(getImportedLogSource('Legs', log.date)).toBe('ai-import:legs:2026-04-17')
    })
})
