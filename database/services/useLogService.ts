import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import * as schema from '@/database/schema'
import {
    ExerciseTable,
    WorkoutExerciseTable,
    WorkoutLogExerciseTable,
    WorkoutLogTable,
    WorkoutTable
} from '@/database/schema'
import { and, asc, desc, eq } from 'drizzle-orm'
import { CompletedWorkoutHistoryItem, CompletedWorkoutSession, ExerciseLog } from '@/database/entities'
import { WorkoutProgressSession } from '@/store/types'
import { getBestAchieved, getPersistableSets } from '@/database/services/logSessionMapper'
import { buildWorkoutStats, WorkoutStats } from '@/database/stats'
import { buildCompletedWorkoutHistory, buildCompletedWorkoutSession } from '@/database/logHistory'
import { buildExerciseHistory, ExerciseHistoryItem } from '@/database/exerciseHistory'

export const useLogService = () => {
    const db = useSQLiteContext();
    const drizzleDb = drizzle(db, { schema });

    const getRecentExerciseLogs = async (
        workoutId: number,
        exerciseId: number,
        limit: number = 3
    ): Promise<ExerciseLog[]> => {
        return drizzleDb
            .select({
                logId: WorkoutLogTable.id,
                date: WorkoutLogTable.date,
                duration: WorkoutLogTable.duration,
                exerciseLogId: WorkoutLogExerciseTable.id,
                details: WorkoutLogExerciseTable.details,
                notes: WorkoutLogExerciseTable.notes,
                restTime: WorkoutLogExerciseTable.restTime,
                bestAchieved: WorkoutLogExerciseTable.bestAchieved
            })
            .from(WorkoutLogExerciseTable)
            .innerJoin(
                WorkoutLogTable,
                eq(WorkoutLogExerciseTable.workoutLogId, WorkoutLogTable.id)
            )
            .where(
                and(
                    eq(WorkoutLogTable.workoutId, workoutId),
                    eq(WorkoutLogExerciseTable.exerciseId, exerciseId)
                )
            )
            .orderBy(desc(WorkoutLogTable.date))
            .limit(limit);
    }

    const getExerciseHistory = async ({
        exerciseId,
        workoutId,
        limit,
        offset
    }: {
        exerciseId: number
        workoutId?: number
        limit: number
        offset: number
    }): Promise<ExerciseHistoryItem[]> => {
        const rows = await drizzleDb
            .select({
                workoutLogId: WorkoutLogTable.id,
                workoutId: WorkoutLogTable.workoutId,
                workoutTitle: WorkoutTable.title,
                date: WorkoutLogTable.date,
                duration: WorkoutLogTable.duration,
                exerciseLogId: WorkoutLogExerciseTable.id,
                details: WorkoutLogExerciseTable.details,
                notes: WorkoutLogExerciseTable.notes,
                restTime: WorkoutLogExerciseTable.restTime,
                bestAchieved: WorkoutLogExerciseTable.bestAchieved
            })
            .from(WorkoutLogExerciseTable)
            .innerJoin(
                WorkoutLogTable,
                eq(WorkoutLogExerciseTable.workoutLogId, WorkoutLogTable.id)
            )
            .innerJoin(
                WorkoutTable,
                eq(WorkoutLogTable.workoutId, WorkoutTable.id)
            )
            .where(
                workoutId
                    ? and(
                        eq(WorkoutLogTable.workoutId, workoutId),
                        eq(WorkoutLogExerciseTable.exerciseId, exerciseId)
                    )
                    : eq(WorkoutLogExerciseTable.exerciseId, exerciseId)
            )
            .orderBy(desc(WorkoutLogTable.date), desc(WorkoutLogTable.id))
            .limit(limit)
            .offset(offset)

        return buildExerciseHistory(rows)
    }

    const saveWorkoutSession = async (session: WorkoutProgressSession) => {
        const completedAt = new Date()
        const duration = Math.max(
            0,
            Math.round((completedAt.getTime() - session.startedAt.getTime()) / 1000)
        )
        const exercisesToPersist = session.exercises
            .map((exercise) => ({
                ...exercise,
                details: getPersistableSets(exercise.details),
                bestAchieved: getBestAchieved(exercise)
            }))
            .filter((exercise) => exercise.details.length > 0)

        const workoutLogResult = await drizzleDb.insert(WorkoutLogTable).values({
            workoutId: session.workoutId,
            date: completedAt,
            duration
        })
        const workoutLogId = workoutLogResult.lastInsertRowId

        if (exercisesToPersist.length > 0) {
            await drizzleDb.insert(WorkoutLogExerciseTable).values(
                exercisesToPersist.map((exercise) => ({
                    workoutLogId,
                    exerciseId: exercise.exerciseId,
                    details: exercise.details,
                    notes: exercise.notes,
                    restTime: exercise.restTime,
                    bestAchieved: exercise.bestAchieved
                }))
            )
        }

        await drizzleDb
            .update(WorkoutTable)
            .set({ lastWorkout: completedAt })
            .where(eq(WorkoutTable.id, session.workoutId))

        await Promise.all(exercisesToPersist.map((exercise) => drizzleDb
            .update(WorkoutExerciseTable)
            .set({
                lastCompleted: completedAt,
                bestAchieved: exercise.bestAchieved
            })
            .where(and(
                eq(WorkoutExerciseTable.workoutId, session.workoutId),
                eq(WorkoutExerciseTable.exerciseId, exercise.exerciseId)
            ))))

        return workoutLogId
    }

    const getWorkoutStats = async (): Promise<WorkoutStats> => {
        const rows = await drizzleDb
            .select({
                workoutLogId: WorkoutLogTable.id,
                workoutTitle: WorkoutTable.title,
                date: WorkoutLogTable.date,
                duration: WorkoutLogTable.duration,
                exerciseId: WorkoutLogExerciseTable.exerciseId,
                exerciseTitle: ExerciseTable.title,
                details: WorkoutLogExerciseTable.details,
                bestAchieved: WorkoutLogExerciseTable.bestAchieved
            })
            .from(WorkoutLogExerciseTable)
            .innerJoin(
                WorkoutLogTable,
                eq(WorkoutLogExerciseTable.workoutLogId, WorkoutLogTable.id)
            )
            .innerJoin(
                WorkoutTable,
                eq(WorkoutLogTable.workoutId, WorkoutTable.id)
            )
            .innerJoin(
                ExerciseTable,
                eq(WorkoutLogExerciseTable.exerciseId, ExerciseTable.id)
            )

        return buildWorkoutStats(rows)
    }

    const getCompletedWorkoutHistory = async (): Promise<CompletedWorkoutHistoryItem[]> => {
        const rows = await drizzleDb
            .select({
                workoutLogId: WorkoutLogTable.id,
                workoutId: WorkoutLogTable.workoutId,
                workoutTitle: WorkoutTable.title,
                date: WorkoutLogTable.date,
                duration: WorkoutLogTable.duration,
                exerciseLogId: WorkoutLogExerciseTable.id,
                exerciseId: WorkoutLogExerciseTable.exerciseId,
                exerciseTitle: ExerciseTable.title,
                details: WorkoutLogExerciseTable.details,
                notes: WorkoutLogExerciseTable.notes,
                restTime: WorkoutLogExerciseTable.restTime,
                bestAchieved: WorkoutLogExerciseTable.bestAchieved
            })
            .from(WorkoutLogTable)
            .innerJoin(
                WorkoutTable,
                eq(WorkoutLogTable.workoutId, WorkoutTable.id)
            )
            .leftJoin(
                WorkoutLogExerciseTable,
                eq(WorkoutLogExerciseTable.workoutLogId, WorkoutLogTable.id)
            )
            .leftJoin(
                ExerciseTable,
                eq(WorkoutLogExerciseTable.exerciseId, ExerciseTable.id)
            )
            .orderBy(desc(WorkoutLogTable.date), desc(WorkoutLogTable.id))

        return buildCompletedWorkoutHistory(rows)
    }

    const getCompletedWorkoutSession = async (
        workoutLogId: number
    ): Promise<CompletedWorkoutSession | undefined> => {
        const rows = await drizzleDb
            .select({
                workoutLogId: WorkoutLogTable.id,
                workoutId: WorkoutLogTable.workoutId,
                workoutTitle: WorkoutTable.title,
                date: WorkoutLogTable.date,
                duration: WorkoutLogTable.duration,
                exerciseLogId: WorkoutLogExerciseTable.id,
                exerciseId: WorkoutLogExerciseTable.exerciseId,
                exerciseTitle: ExerciseTable.title,
                details: WorkoutLogExerciseTable.details,
                notes: WorkoutLogExerciseTable.notes,
                restTime: WorkoutLogExerciseTable.restTime,
                bestAchieved: WorkoutLogExerciseTable.bestAchieved
            })
            .from(WorkoutLogTable)
            .innerJoin(
                WorkoutTable,
                eq(WorkoutLogTable.workoutId, WorkoutTable.id)
            )
            .leftJoin(
                WorkoutLogExerciseTable,
                eq(WorkoutLogExerciseTable.workoutLogId, WorkoutLogTable.id)
            )
            .leftJoin(
                ExerciseTable,
                eq(WorkoutLogExerciseTable.exerciseId, ExerciseTable.id)
            )
            .where(eq(WorkoutLogTable.id, workoutLogId))
            .orderBy(asc(WorkoutLogExerciseTable.id))

        return buildCompletedWorkoutSession(rows)
    }

    return {
        getRecentExerciseLogs,
        getExerciseHistory,
        saveWorkoutSession,
        getWorkoutStats,
        getCompletedWorkoutHistory,
        getCompletedWorkoutSession
    }
}
