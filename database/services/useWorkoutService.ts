import { useSQLiteContext } from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as schema from '@/database/schema'
import { WorkoutTable } from '@/database/schema'
import { ExerciseWorkoutDetails, Workout } from '@/database/entities'
import { and, eq, inArray } from 'drizzle-orm'

export const useWorkoutService = () => {
    const db = useSQLiteContext();
    const drizzleDb = drizzle(db, { schema });

    const getWorkouts = async (): Promise<Workout[]> => {
        return drizzleDb.select().from(WorkoutTable)
    }

    const addWorkout = async (workout: Omit<Workout, 'id' | 'createdAt'>) => {
        const result = await drizzleDb.insert(WorkoutTable).values(workout)
        return result.lastInsertRowId
    }

    const getWorkoutById = async (workoutId: number): Promise<Workout | undefined> => {
        const result = await drizzleDb.select().from(WorkoutTable).where(eq(WorkoutTable.id, workoutId))
        return result.at(0) ?? undefined
    }

    const addWorkoutExercises = async (workoutId: number, exercises: number[]) => {
        await drizzleDb.insert(schema.WorkoutExerciseTable).values(exercises.map((exerciseId) => ({
            workoutId,
            exerciseId
        }))).onConflictDoNothing()
    }

    const removeWorkoutExercises = async (workoutId: number, exercises: number[]) => {
        await drizzleDb.delete(schema.WorkoutExerciseTable).where(
            and(
                eq(schema.WorkoutExerciseTable.workoutId, workoutId),
                inArray(schema.WorkoutExerciseTable.exerciseId, exercises)
            )
        );
    }

    const getWorkoutExercisesWithDetails = async (workoutId: number): Promise<ExerciseWorkoutDetails[]> => {
        const result = await drizzleDb
            .select({
                id: schema.ExerciseTable.id,
                title: schema.ExerciseTable.title,
                photo: schema.ExerciseTable.photo,
                notes: schema.WorkoutExerciseTable.notes,
                isCustom: schema.ExerciseTable.isCustom,
                // bestAchieved: schema.WorkoutLogExerciseTable.bestAchieved,
                isArchived: schema.WorkoutExerciseTable.isArchived
            })
            .from(schema.WorkoutExerciseTable)
            .innerJoin(
                schema.ExerciseTable,
                eq(schema.WorkoutExerciseTable.exerciseId, schema.ExerciseTable.id)
            )
            .where(eq(schema.WorkoutExerciseTable.workoutId, workoutId));

        return result.map((exercise) => ({
            ...exercise,
            isArchived: exercise.isArchived === 1,
            isCustom: exercise.isCustom === 1,
            notes: exercise.notes ?? undefined
        }))
    };

    return {
        getWorkouts,
        addWorkout,
        getWorkoutById,
        getWorkoutExercisesWithDetails,
        addWorkoutExercises,
        removeWorkoutExercises
    }
}