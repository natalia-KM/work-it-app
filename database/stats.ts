import { ExerciseLogDetails } from '@/database/entities'

export interface WorkoutTrendPoint {
    key: string
    label: string
    volume: number
    workouts: number
    sets: number
}

export interface ExerciseVolumeStat {
    exerciseId: number
    title: string
    volume: number
    sets: number
    bestSetScore: number
}

export interface SessionHighlight {
    workoutLogId: number
    workoutTitle: string
    date: Date | null
    duration: number | null
    volume: number
    sets: number
}

export interface WorkoutStats {
    completedWorkouts: number
    loggedExercises: number
    loggedSets: number
    totalVolume: number
    bestSetScore: number
    lastWorkoutDate?: Date | null
    activeDays: number
    currentStreakDays: number
    longestStreakDays: number
    thisWeekWorkouts: number
    thisMonthWorkouts: number
    averageSessionVolume: number
    averageDurationSeconds: number
    heaviestWeight: number
    sevenDayVolumeChangePercent: number
    dailyVolumeTrend: WorkoutTrendPoint[]
    topExercises: ExerciseVolumeStat[]
    bestSession?: SessionHighlight
}

export interface WorkoutStatsSourceRow {
    workoutLogId: number
    workoutTitle: string | null
    date: Date | null
    duration: number | null
    exerciseId: number
    exerciseTitle: string | null
    details: ExerciseLogDetails[] | null
    bestAchieved: number | null
}

interface SessionAccumulator {
    workoutLogId: number
    workoutTitle: string
    date: Date | null
    duration: number | null
    volume: number
    sets: number
}

const dayMs = 24 * 60 * 60 * 1000
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const asDate = (value: Date | null | number | string) => {
    if (!value) return null

    const date = value instanceof Date ? value : new Date(value)

    return Number.isNaN(date.getTime()) ? null : date
}

const getDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${year}-${month}-${day}`
}

const getDayLabel = (date: Date) => weekdayLabels[date.getDay()]

const getStartOfWeek = (date: Date) => {
    const day = date.getDay()
    const diff = day === 0 ? 6 : day - 1
    const start = startOfDay(date)

    start.setDate(start.getDate() - diff)

    return start
}

const calculateStreaks = (dateKeys: string[], now: Date) => {
    if (dateKeys.length === 0) {
        return { currentStreakDays: 0, longestStreakDays: 0 }
    }

    const sortedTimes = [...new Set(dateKeys)]
        .map((key) => startOfDay(new Date(`${key}T00:00:00`)).getTime())
        .sort((a, b) => b - a)

    const today = startOfDay(now).getTime()
    const yesterday = today - dayMs
    const latestWorkoutTime = sortedTimes[0]
    let currentStreakDays = latestWorkoutTime === today || latestWorkoutTime === yesterday ? 1 : 0

    for (let index = 1; index < sortedTimes.length; index += 1) {
        if (currentStreakDays === 0) break
        if (sortedTimes[index - 1] - sortedTimes[index] !== dayMs) break
        currentStreakDays += 1
    }

    let longestStreakDays = 1
    let runningStreak = 1
    for (let index = 1; index < sortedTimes.length; index += 1) {
        if (sortedTimes[index - 1] - sortedTimes[index] === dayMs) {
            runningStreak += 1
        } else {
            runningStreak = 1
        }

        longestStreakDays = Math.max(longestStreakDays, runningStreak)
    }

    return { currentStreakDays, longestStreakDays }
}

export const buildWorkoutStats = (
    rows: WorkoutStatsSourceRow[],
    now: Date = new Date()
): WorkoutStats => {
    const sessions = new Map<number, SessionAccumulator>()
    const exerciseStats = new Map<number, ExerciseVolumeStat>()
    const dailyStats = new Map<string, WorkoutTrendPoint>()
    const activeDateKeys = new Set<string>()
    const currentWeekStart = getStartOfWeek(now)
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastSevenDaysStart = startOfDay(new Date(now.getTime() - 6 * dayMs))
    const previousSevenDaysStart = startOfDay(new Date(now.getTime() - 13 * dayMs))

    let loggedSets = 0
    let totalVolume = 0
    let bestSetScore = 0
    let heaviestWeight = 0
    let lastWorkoutDate: Date | null = null
    let currentSevenDayVolume = 0
    let previousSevenDayVolume = 0

    for (let offset = 6; offset >= 0; offset -= 1) {
        const date = startOfDay(new Date(now.getTime() - offset * dayMs))
        const key = getDateKey(date)

        dailyStats.set(key, {
            key,
            label: getDayLabel(date),
            volume: 0,
            workouts: 0,
            sets: 0
        })
    }

    rows.forEach((row) => {
        const rowDate = asDate(row.date)
        const date = rowDate ? startOfDay(rowDate) : null
        const dateKey = date ? getDateKey(date) : undefined
        const sets = Array.isArray(row.details) ? row.details : []
        const rowVolume = sets.reduce((sum, set) => {
            const weight = Number.isFinite(set.weight) ? set.weight : 0
            const reps = Number.isFinite(set.reps) ? set.reps : 0

            return sum + (weight * reps)
        }, 0)
        const workoutTitle = row.workoutTitle ?? 'Workout'
        const exerciseTitle = row.exerciseTitle ?? 'Exercise'

        let session = sessions.get(row.workoutLogId)
        if (!session) {
            session = {
                workoutLogId: row.workoutLogId,
                workoutTitle,
                date: rowDate,
                duration: row.duration,
                volume: 0,
                sets: 0
            }
            sessions.set(row.workoutLogId, session)
        }

        session.volume += rowVolume
        session.sets += sets.length

        if (rowDate && (!lastWorkoutDate || rowDate > lastWorkoutDate)) {
            lastWorkoutDate = rowDate
        }

        if (dateKey) {
            activeDateKeys.add(dateKey)
        }

        let exercise = exerciseStats.get(row.exerciseId)
        if (!exercise) {
            exercise = {
                exerciseId: row.exerciseId,
                title: exerciseTitle,
                volume: 0,
                sets: 0,
                bestSetScore: 0
            }
            exerciseStats.set(row.exerciseId, exercise)
        }

        exercise.volume += rowVolume
        exercise.sets += sets.length
        exercise.bestSetScore = Math.max(exercise.bestSetScore, row.bestAchieved ?? 0)

        bestSetScore = Math.max(bestSetScore, row.bestAchieved ?? 0)
        loggedSets += sets.length
        totalVolume += rowVolume

        sets.forEach((set) => {
            heaviestWeight = Math.max(heaviestWeight, Number.isFinite(set.weight) ? set.weight : 0)
        })

        if (date) {
            const dayStat = dailyStats.get(dateKey!)
            if (dayStat) {
                dayStat.volume += rowVolume
                dayStat.sets += sets.length
            }

            if (date >= lastSevenDaysStart) {
                currentSevenDayVolume += rowVolume
            } else if (date >= previousSevenDaysStart) {
                previousSevenDayVolume += rowVolume
            }
        }
    })

    sessions.forEach((session) => {
        if (!session.date) return

        const date = startOfDay(session.date)
        const key = getDateKey(date)

        const dayStat = dailyStats.get(key)
        if (dayStat) {
            dayStat.workouts += 1
        }
    })

    const sessionsList = [...sessions.values()]
    const thisWeekWorkouts = sessionsList.filter((session) => (
        session.date ? startOfDay(session.date) >= currentWeekStart : false
    )).length
    const thisMonthWorkouts = sessionsList.filter((session) => (
        session.date
            ? session.date.getMonth() === currentMonth && session.date.getFullYear() === currentYear
            : false
    )).length
    const sessionsWithDuration = sessionsList.filter((session) => typeof session.duration === 'number')
    const averageDurationSeconds = sessionsWithDuration.length > 0
        ? sessionsWithDuration.reduce((sum, session) => sum + (session.duration ?? 0), 0) / sessionsWithDuration.length
        : 0
    const bestSession = sessionsList
        .sort((a, b) => b.volume - a.volume)[0]
    const { currentStreakDays, longestStreakDays } = calculateStreaks([...activeDateKeys], now)
    const sevenDayVolumeChangePercent = previousSevenDayVolume > 0
        ? ((currentSevenDayVolume - previousSevenDayVolume) / previousSevenDayVolume) * 100
        : currentSevenDayVolume > 0 ? 100 : 0

    return {
        completedWorkouts: sessions.size,
        loggedExercises: rows.length,
        loggedSets,
        totalVolume,
        bestSetScore,
        lastWorkoutDate,
        activeDays: activeDateKeys.size,
        currentStreakDays,
        longestStreakDays,
        thisWeekWorkouts,
        thisMonthWorkouts,
        averageSessionVolume: sessions.size > 0 ? totalVolume / sessions.size : 0,
        averageDurationSeconds,
        heaviestWeight,
        sevenDayVolumeChangePercent,
        dailyVolumeTrend: [...dailyStats.values()],
        topExercises: [...exerciseStats.values()]
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 5),
        bestSession: bestSession
            ? {
                workoutLogId: bestSession.workoutLogId,
                workoutTitle: bestSession.workoutTitle,
                date: bestSession.date,
                duration: bestSession.duration,
                volume: bestSession.volume,
                sets: bestSession.sets
            }
            : undefined
    }
}

