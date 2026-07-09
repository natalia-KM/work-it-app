import { and, eq } from 'drizzle-orm'
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'
import * as schema from '@/database/schema'
import {
    ExerciseTable,
    WorkoutExerciseTable,
    WorkoutLogExerciseTable,
    WorkoutLogTable,
    WorkoutTable
} from '@/database/schema'
import { WorkoutNotesImport } from '@/database/importTypes'
import { getImportedLogSource, getLogBestAchieved, getLogDetails } from '@/database/services/importWorkoutNotesMapper'

export interface ImportSaveSummary {
    workouts: number
    exercises: number
    logs: number
    exerciseLogs: number
}

const cleanText = (value?: string | null) => {
    const cleaned = value?.trim()
    return cleaned && cleaned.length > 0 ? cleaned : null
}

const toImportedDate = (date: string) => new Date(`${date}T12:00:00`)

type DrizzleDb = ExpoSQLiteDatabase<typeof schema>

export const saveWorkoutNotesImport = async (
    drizzleDb: DrizzleDb,
    parsedImport: WorkoutNotesImport
): Promise<ImportSaveSummary> => {
    const summary: ImportSaveSummary = {
        workouts: 0,
        exercises: 0,
        logs: 0,
        exerciseLogs: 0
    }

    for (const workout of parsedImport.workouts) {
        const workoutTitle = workout.title.trim()
        const existingWorkout = await drizzleDb
            .select()
            .from(WorkoutTable)
            .where(eq(WorkoutTable.title, workoutTitle))
            .limit(1)

        let workoutId = existingWorkout[0]?.id
        if (!workoutId) {
            const result = await drizzleDb.insert(WorkoutTable).values({
                title: workoutTitle,
                notes: cleanText(workout.notes),
                color: null,
                lastWorkout: null
            })
            workoutId = result.lastInsertRowId
            summary.workouts += 1
        } else if (cleanText(workout.notes)) {
            await drizzleDb
                .update(WorkoutTable)
                .set({ notes: cleanText(workout.notes) })
                .where(eq(WorkoutTable.id, workoutId))
        }

        let latestWorkoutDate: Date | null = existingWorkout[0]?.lastWorkout ?? null

        for (const exercise of workout.exercises) {
            const exerciseTitle = exercise.title.trim()
            const existingExercise = await drizzleDb
                .select()
                .from(ExerciseTable)
                .where(eq(ExerciseTable.title, exerciseTitle))
                .limit(1)

            let exerciseId = existingExercise[0]?.id
            if (!exerciseId) {
                const result = await drizzleDb.insert(ExerciseTable).values({
                    title: exerciseTitle,
                    photo: null,
                    isCustom: 1,
                    instructions: cleanText(exercise.instructions)
                })
                exerciseId = result.lastInsertRowId
                summary.exercises += 1
            } else if (cleanText(exercise.instructions)) {
                await drizzleDb
                    .update(ExerciseTable)
                    .set({ instructions: cleanText(exercise.instructions) })
                    .where(eq(ExerciseTable.id, exerciseId))
            }

            const existingWorkoutExercise = await drizzleDb
                .select()
                .from(WorkoutExerciseTable)
                .where(and(
                    eq(WorkoutExerciseTable.workoutId, workoutId),
                    eq(WorkoutExerciseTable.exerciseId, exerciseId)
                ))
                .limit(1)

            const workoutExerciseData = {
                workoutId,
                exerciseId,
                isArchived: 0,
                isOptional: exercise.isOptional ? 1 : 0,
                sortOrder: exercise.sortOrder,
                targetSets: exercise.targetSets ?? null,
                targetReps: exercise.targetReps ?? null,
                targetWeight: exercise.targetWeight ?? null,
                notes: cleanText(exercise.notes)
            }

            if (existingWorkoutExercise[0]) {
                await drizzleDb
                    .update(WorkoutExerciseTable)
                    .set(workoutExerciseData)
                    .where(eq(WorkoutExerciseTable.id, existingWorkoutExercise[0].id))
            } else {
                await drizzleDb.insert(WorkoutExerciseTable).values(workoutExerciseData)
            }

            let latestExerciseDate: Date | null = existingWorkoutExercise[0]?.lastCompleted ?? null
            let bestAchieved = existingWorkoutExercise[0]?.bestAchieved ?? null

            for (const log of exercise.logs) {
                const importedDate = toImportedDate(log.date)
                const source = getImportedLogSource(workoutTitle, log.date)
                const existingWorkoutLog = await drizzleDb
                    .select()
                    .from(WorkoutLogTable)
                    .where(and(
                        eq(WorkoutLogTable.workoutId, workoutId),
                        eq(WorkoutLogTable.source, source)
                    ))
                    .limit(1)

                let workoutLogId = existingWorkoutLog[0]?.id
                if (!workoutLogId) {
                    const result = await drizzleDb.insert(WorkoutLogTable).values({
                        workoutId,
                        date: importedDate,
                        duration: null,
                        source
                    })
                    workoutLogId = result.lastInsertRowId
                    summary.logs += 1
                }

                const logBest = getLogBestAchieved(log)
                const existingExerciseLog = await drizzleDb
                    .select()
                    .from(WorkoutLogExerciseTable)
                    .where(and(
                        eq(WorkoutLogExerciseTable.workoutLogId, workoutLogId),
                        eq(WorkoutLogExerciseTable.exerciseId, exerciseId)
                    ))
                    .limit(1)

                const exerciseLogData = {
                    workoutLogId,
                    exerciseId,
                    details: getLogDetails(log),
                    notes: cleanText(log.notes),
                    restTime: 0,
                    bestAchieved: logBest
                }

                if (existingExerciseLog[0]) {
                    await drizzleDb
                        .update(WorkoutLogExerciseTable)
                        .set(exerciseLogData)
                        .where(eq(WorkoutLogExerciseTable.id, existingExerciseLog[0].id))
                } else {
                    await drizzleDb.insert(WorkoutLogExerciseTable).values(exerciseLogData)
                    summary.exerciseLogs += 1
                }

                if (!latestWorkoutDate || importedDate > latestWorkoutDate) latestWorkoutDate = importedDate
                if (!latestExerciseDate || importedDate > latestExerciseDate) latestExerciseDate = importedDate
                bestAchieved = Math.max(bestAchieved ?? 0, logBest)
            }

            await drizzleDb
                .update(WorkoutExerciseTable)
                .set({
                    lastCompleted: latestExerciseDate,
                    bestAchieved
                })
                .where(and(
                    eq(WorkoutExerciseTable.workoutId, workoutId),
                    eq(WorkoutExerciseTable.exerciseId, exerciseId)
                ))
        }

        if (latestWorkoutDate) {
            await drizzleDb
                .update(WorkoutTable)
                .set({ lastWorkout: latestWorkoutDate })
                .where(eq(WorkoutTable.id, workoutId))
        }
    }

    return summary
}
