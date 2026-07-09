import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import * as schema from '@/database/schema'
import { WorkoutExerciseTable, WorkoutLogExerciseTable, WorkoutLogTable, WorkoutTable } from '@/database/schema'
import { and, desc, eq } from 'drizzle-orm'
import { ExerciseLog } from '@/database/entities'
import { ExerciseProgressLog, ExerciseProgressLogDetails, WorkoutProgressSession } from '@/store/types'

const getPersistableSets = (details: ExerciseProgressLogDetails[]) => {
    return details
        .filter((detail) => detail.isCompleted || detail.reps > 0 || detail.weight > 0)
        .map(({ set, reps, weight }) => ({ set, reps, weight }))
}

const getBestAchieved = (exercise: ExerciseProgressLog) => {
    const persistableSets = getPersistableSets(exercise.details)
    if (persistableSets.length === 0) return undefined

    return Math.max(...persistableSets.map((set) => Math.max(set.weight * set.reps, set.reps)))
}

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

    return { getRecentExerciseLogs, saveWorkoutSession }
}
