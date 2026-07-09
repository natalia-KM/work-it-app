import * as schema from "@/database/schema";
import {
    ExerciseMuscleTagsTable,
    ExerciseTable,
    MuscleTagsTable,
    WorkoutExerciseTable,
    WorkoutLogExerciseTable
} from "@/database/schema";
import { useSQLiteContext } from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { Exercise, ExerciseDetails, MuscleGroup, MuscleTag } from '@/database/entities'
import { eq } from 'drizzle-orm'

export const useExercisesService = () => {
    const db = useSQLiteContext();
    const drizzleDb = drizzle(db, { schema });

    const exercisesWithTabsQuery = drizzleDb
        .select({
            exerciseId: ExerciseTable.id,
            title: ExerciseTable.title,
            photo: ExerciseTable.photo,
            instructions: ExerciseTable.instructions,
            isCustom: ExerciseTable.isCustom,
            tabId: MuscleTagsTable.id,
            tabName: MuscleTagsTable.name,
            tabMuscleGroup: MuscleTagsTable.muscleGroup
        })
        .from(ExerciseTable)
        .leftJoin(
            ExerciseMuscleTagsTable,
            eq(ExerciseMuscleTagsTable.exerciseId, ExerciseTable.id)
        )
        .leftJoin(
            MuscleTagsTable,
            eq(MuscleTagsTable.id, ExerciseMuscleTagsTable.tabId)
        )

    const addExercise = async (exerciseData: Omit<Exercise, 'id'>) => {
        const data = {
            ...exerciseData,
            isCustom: exerciseData.isCustom ? 1 : 0
        }
        const result = await drizzleDb.insert(ExerciseTable).values(data);
        return result.lastInsertRowId
    }

    const addExerciseTagLinks = async (exerciseId: number, tabIds: number[]) => {
        if (tabIds.length === 0) return;

        const rows = tabIds.map((tabId) => ({
            exerciseId,
            tabId
        }));

        await drizzleDb.insert(ExerciseMuscleTagsTable).values(rows);
    };

    const updateExercise = async (exerciseData: Exercise) => {
        const data = {
            ...exerciseData,
            isCustom: exerciseData.isCustom ? 1 : 0
        }
        await drizzleDb.update(ExerciseTable).set(data).where(eq(ExerciseTable.id, exerciseData.id));
        return exerciseData.id
    };

    const updateTags = async (exerciseId: number, tabIds: number[]) => {
        await drizzleDb.delete(ExerciseMuscleTagsTable).where(eq(ExerciseMuscleTagsTable.exerciseId, exerciseId));
        await addExerciseTagLinks(exerciseId, tabIds);
    };

    const deleteExercise = async (exerciseId: number) => {
        const exercise = await getExerciseById(exerciseId)

        if (!exercise) {
            throw new Error('Exercise could not be found.')
        }

        const [workoutLinks, logLinks] = await Promise.all([
            drizzleDb
                .select({ id: WorkoutExerciseTable.id })
                .from(WorkoutExerciseTable)
                .where(eq(WorkoutExerciseTable.exerciseId, exerciseId))
                .limit(1),
            drizzleDb
                .select({ id: WorkoutLogExerciseTable.id })
                .from(WorkoutLogExerciseTable)
                .where(eq(WorkoutLogExerciseTable.exerciseId, exerciseId))
                .limit(1)
        ])

        if (workoutLinks.length > 0 || logLinks.length > 0) {
            throw new Error('This exercise is already used in workouts or logs and cannot be deleted.')
        }

        await drizzleDb.delete(ExerciseMuscleTagsTable).where(eq(ExerciseMuscleTagsTable.exerciseId, exerciseId));
        await drizzleDb.delete(ExerciseTable).where(eq(ExerciseTable.id, exerciseId));

        return exercise.photo
    };

    const getExercises = async (): Promise<Exercise[]> => {
        const result = await drizzleDb.select().from(ExerciseTable);
        return result.map((exercise) => ({
            ...exercise,
            isCustom: Boolean(exercise.isCustom)
        }))
    };

    const getExerciseById = async (id: number): Promise<ExerciseDetails | null> => {
        const rows = await exercisesWithTabsQuery.where(eq(ExerciseTable.id, id));

        if (!rows.length) return null;

        const { title, photo, instructions, isCustom } = rows[0];

        const tabs: MuscleTag[] = rows
            .filter((r) => r.tabId && r.tabName && r.tabMuscleGroup)
            .map((r) => ({
                id: r.tabId!,
                name: r.tabName!,
                muscleGroup: r.tabMuscleGroup! as MuscleGroup
            }));

        return {
            id,
            title,
            photo,
            instructions,
            isCustom: Boolean(isCustom),
            tabs
        };
    }

    const getExercisesWithTabs = async () => {
        const rows = await exercisesWithTabsQuery;

        const grouped = rows.reduce((acc, row) => {
            const { exerciseId, title, photo, instructions, isCustom, tabId, tabName, tabMuscleGroup } = row;
            if (!acc[exerciseId]) {
                acc[exerciseId] = { id: exerciseId, title, photo, instructions, isCustom: Boolean(isCustom), tabs: [] };
            }
            if (tabId && tabName && tabMuscleGroup) acc[exerciseId].tabs.push({
                id: tabId,
                name: tabName,
                muscleGroup: tabMuscleGroup as MuscleGroup
            });
            return acc;
        }, {} as Record<number, ExerciseDetails>);

        return Object.values(grouped);
    }


    return {
        getExercises,
        getExercisesWithTabs,
        addExercise,
        addExerciseTagLinks,
        getExerciseById,
        updateExercise,
        updateTags,
        deleteExercise
    };
};
