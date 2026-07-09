import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import * as schema from '@/database/schema'
import { WorkoutLogExerciseTable, WorkoutLogTable } from '@/database/schema'
import { and, desc, eq } from 'drizzle-orm'
import { ExerciseLog } from '@/database/entities'

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

    return { getRecentExerciseLogs }
}