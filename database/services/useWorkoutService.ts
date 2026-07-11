import { useSQLiteContext } from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as schema from '@/database/schema'
import { WorkoutTable } from '@/database/schema'
import { ExerciseWorkoutDetails, Workout } from '@/database/entities'
import { and, asc, eq, inArray } from 'drizzle-orm'
import {
    cleanTemplateText,
    normalizeWorkoutTemplateExercises,
    WorkoutTemplateExerciseDraft
} from '@/database/services/workoutTemplateMapper'

export interface UpdateWorkoutTemplateInput {
    workoutId: number
    title: string
    notes?: string | null
    color?: string | null
    exercises: WorkoutTemplateExerciseDraft[]
}

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

    const updateWorkoutTemplate = async ({
        workoutId,
        title,
        notes,
        color,
        exercises
    }: UpdateWorkoutTemplateInput) => {
        await drizzleDb
            .update(WorkoutTable)
            .set({
                title: title.trim(),
                notes: cleanTemplateText(notes),
                color: cleanTemplateText(color)
            })
            .where(eq(WorkoutTable.id, workoutId))

        const normalizedExercises = normalizeWorkoutTemplateExercises(exercises)

        for (const exercise of normalizedExercises) {
            await drizzleDb
                .update(schema.WorkoutExerciseTable)
                .set({
                    isOptional: exercise.isOptional,
                    sortOrder: exercise.sortOrder,
                    targetSets: exercise.targetSets,
                    targetReps: exercise.targetReps,
                    targetWeight: exercise.targetWeight,
                    notes: exercise.notes
                })
                .where(and(
                    eq(schema.WorkoutExerciseTable.workoutId, workoutId),
                    eq(schema.WorkoutExerciseTable.exerciseId, exercise.exerciseId)
                ))
        }
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
                instructions: schema.ExerciseTable.instructions,
                notes: schema.WorkoutExerciseTable.notes,
                isCustom: schema.ExerciseTable.isCustom,
                bestAchieved: schema.WorkoutExerciseTable.bestAchieved,
                isArchived: schema.WorkoutExerciseTable.isArchived,
                isOptional: schema.WorkoutExerciseTable.isOptional,
                sortOrder: schema.WorkoutExerciseTable.sortOrder,
                targetSets: schema.WorkoutExerciseTable.targetSets,
                targetReps: schema.WorkoutExerciseTable.targetReps,
                targetWeight: schema.WorkoutExerciseTable.targetWeight,
                lastCompleted: schema.WorkoutExerciseTable.lastCompleted
            })
            .from(schema.WorkoutExerciseTable)
            .innerJoin(
                schema.ExerciseTable,
                eq(schema.WorkoutExerciseTable.exerciseId, schema.ExerciseTable.id)
            )
            .where(eq(schema.WorkoutExerciseTable.workoutId, workoutId))
            .orderBy(asc(schema.WorkoutExerciseTable.sortOrder), asc(schema.ExerciseTable.title));

        return result.map((exercise) => ({
            ...exercise,
            isArchived: exercise.isArchived === 1,
            isOptional: exercise.isOptional === 1,
            isCustom: exercise.isCustom === 1,
            notes: exercise.notes ?? undefined,
            bestAchieved: exercise.bestAchieved,
            lastCompleted: exercise.lastCompleted
        }))
    };

    return {
        getWorkouts,
        addWorkout,
        getWorkoutById,
        getWorkoutExercisesWithDetails,
        addWorkoutExercises,
        removeWorkoutExercises,
        updateWorkoutTemplate
    }
}
