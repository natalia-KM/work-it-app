import { describe, expect, it } from 'vitest'
import { buildWorkoutStats, WorkoutStatsSourceRow } from '@/database/stats'

const row = (overrides: Partial<WorkoutStatsSourceRow>): WorkoutStatsSourceRow => ({
    workoutLogId: 1,
    workoutTitle: 'Push',
    date: new Date('2026-07-10T09:00:00'),
    duration: 3600,
    exerciseId: 10,
    exerciseTitle: 'Bench press',
    details: [{ set: 1, reps: 10, weight: 80 }],
    bestAchieved: 800,
    ...overrides
})

describe('workout stats analytics', () => {
    it('builds aggregate stats, rankings, and best session from log rows', () => {
        const stats = buildWorkoutStats([
            row({
                workoutLogId: 1,
                workoutTitle: 'Push',
                exerciseId: 10,
                exerciseTitle: 'Bench press',
                details: [
                    { set: 1, reps: 10, weight: 80 },
                    { set: 2, reps: 8, weight: 90 }
                ],
                bestAchieved: 800
            }),
            row({
                workoutLogId: 1,
                workoutTitle: 'Push',
                exerciseId: 11,
                exerciseTitle: 'Shoulder press',
                details: [{ set: 1, reps: 8, weight: 40 }],
                bestAchieved: 320
            }),
            row({
                workoutLogId: 2,
                workoutTitle: 'Legs',
                date: new Date('2026-07-09T09:00:00'),
                duration: 3000,
                exerciseId: 12,
                exerciseTitle: 'Squat',
                details: [{ set: 1, reps: 5, weight: 120 }],
                bestAchieved: 600
            })
        ], new Date('2026-07-10T12:00:00'))

        expect(stats.completedWorkouts).toBe(2)
        expect(stats.loggedExercises).toBe(3)
        expect(stats.loggedSets).toBe(4)
        expect(stats.totalVolume).toBe(2440)
        expect(stats.averageSessionVolume).toBe(1220)
        expect(stats.averageDurationSeconds).toBe(3300)
        expect(stats.heaviestWeight).toBe(120)
        expect(stats.bestSession).toMatchObject({
            workoutLogId: 1,
            workoutTitle: 'Push',
            volume: 1840,
            sets: 3
        })
        expect(stats.topExercises[0]).toMatchObject({
            exerciseId: 10,
            title: 'Bench press',
            volume: 1520
        })
    })

    it('tracks streaks and daily volume for the last seven days', () => {
        const stats = buildWorkoutStats([
            row({ workoutLogId: 1, date: new Date('2026-07-10T09:00:00') }),
            row({ workoutLogId: 2, date: new Date('2026-07-09T09:00:00') }),
            row({ workoutLogId: 3, date: new Date('2026-07-07T09:00:00') }),
            row({ workoutLogId: 4, date: new Date('2026-07-06T09:00:00') }),
            row({ workoutLogId: 5, date: new Date('2026-07-05T09:00:00') })
        ], new Date('2026-07-10T12:00:00'))

        expect(stats.currentStreakDays).toBe(2)
        expect(stats.longestStreakDays).toBe(3)
        expect(stats.thisWeekWorkouts).toBe(4)
        expect(stats.thisMonthWorkouts).toBe(5)
        expect(stats.dailyVolumeTrend).toHaveLength(7)
        expect(stats.dailyVolumeTrend.at(-1)).toMatchObject({
            key: '2026-07-10',
            volume: 800,
            workouts: 1,
            sets: 1
        })
    })

    it('does not count stale historical activity as the current streak', () => {
        const stats = buildWorkoutStats([
            row({ workoutLogId: 1, date: new Date('2026-07-01T09:00:00') }),
            row({ workoutLogId: 2, date: new Date('2026-06-30T09:00:00') })
        ], new Date('2026-07-10T12:00:00'))

        expect(stats.currentStreakDays).toBe(0)
        expect(stats.longestStreakDays).toBe(2)
    })
})
