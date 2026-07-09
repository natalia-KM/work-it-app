import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import * as schema from '@/database/schema'
import { WorkoutExerciseTable, WorkoutLogExerciseTable, WorkoutLogTable, WorkoutTable } from '@/database/schema'
import { and, desc, eq } from 'drizzle-orm'
import { ExerciseLog } from '@/database/entities'
import { WorkoutProgressSession } from '@/store/types'
import { getBestAchieved, getPersistableSets } from '@/database/services/logSessionMapper'
import { WorkoutStats } from '@/database/stats'

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
                date: WorkoutLogTable.date,
                details: WorkoutLogExerciseTable.details,
                bestAchieved: WorkoutLogExerciseTable.bestAchieved
            })
            .from(WorkoutLogExerciseTable)
            .innerJoin(
                WorkoutLogTable,
                eq(WorkoutLogExerciseTable.workoutLogId, WorkoutLogTable.id)
            )

        const workoutIds = new Set<number>()
        let loggedSets = 0
        let totalVolume = 0
        let bestSetScore = 0
        let lastWorkoutDate: Date | null = null

        rows.forEach((row) => {
            workoutIds.add(row.workoutLogId)
            if (!lastWorkoutDate || (row.date && row.date > lastWorkoutDate)) {
                lastWorkoutDate = row.date
            }

            bestSetScore = Math.max(bestSetScore, row.bestAchieved ?? 0)

            row.details?.forEach((set) => {
                loggedSets += 1
                totalVolume += set.weight * set.reps
            })
        })

        return {
            completedWorkouts: workoutIds.size,
            loggedExercises: rows.length,
            loggedSets,
            totalVolume,
            bestSetScore,
            lastWorkoutDate
        }
    }

    return { getRecentExerciseLogs, saveWorkoutSession, getWorkoutStats }
}
