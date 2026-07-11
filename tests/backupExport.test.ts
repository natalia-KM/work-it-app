import { describe, expect, it } from 'vitest'
import {
    createBackupExportPayload,
    getBackupExportFilename,
    serializeBackupExport
} from '@/database/backupExport'

const emptyExportData = {
    exercises: [],
    muscleTags: [],
    exerciseMuscleTags: [],
    workouts: [],
    workoutExercises: [],
    workoutLogs: [],
    workoutLogExercises: [],
    activeWorkoutDraft: null
}

describe('backup export mapping', () => {
    it('builds a versioned backup envelope with an ISO export timestamp', () => {
        const exportedAt = new Date('2026-07-11T18:45:00.000Z')
        const payload = createBackupExportPayload(emptyExportData, exportedAt)

        expect(payload).toEqual({
            app: 'work-it-app',
            version: 1,
            exportedAt: '2026-07-11T18:45:00.000Z',
            data: emptyExportData
        })
    })

    it('serializes table rows and dates as JSON-safe values', () => {
        const payload = createBackupExportPayload({
            ...emptyExportData,
            workouts: [{
                id: 1,
                title: 'Push',
                lastWorkout: new Date('2026-07-10T12:00:00.000Z')
            }],
            workoutLogExercises: [{
                id: 9,
                restTime: 90,
                details: [{ set: 1, reps: 8, weight: 50 }]
            }]
        }, new Date('2026-07-11T18:45:00.000Z'))

        expect(JSON.parse(serializeBackupExport(payload))).toMatchObject({
            data: {
                workouts: [{
                    id: 1,
                    title: 'Push',
                    lastWorkout: '2026-07-10T12:00:00.000Z'
                }],
                workoutLogExercises: [{
                    id: 9,
                    restTime: 90,
                    details: [{ set: 1, reps: 8, weight: 50 }]
                }]
            }
        })
    })

    it('formats backup filenames from export timestamps', () => {
        expect(getBackupExportFilename(new Date('2026-07-11T18:45:00.000Z')))
            .toBe('work-it-backup-20260711-1845.json')
        expect(getBackupExportFilename('not-a-date')).toBe('work-it-backup.json')
    })
})
