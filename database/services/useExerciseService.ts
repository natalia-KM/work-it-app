import * as schema from "@/database/schema";
import { ExerciseMuscleTagsTable, ExerciseTable, MuscleTagsTable } from "@/database/schema";
import { useSQLiteContext } from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { Exercise, ExerciseDetails, MuscleGroup } from '@/database/entities'
import { eq } from 'drizzle-orm'

export const useExercisesService = () => {
    const db = useSQLiteContext();
    const drizzleDb = drizzle(db, { schema });

    const getExercises = async (): Promise<Exercise[]> => {
        const result = await drizzleDb.select().from(ExerciseTable);
        return result.map((exercise) => ({
            ...exercise,
            isCustom: Boolean(exercise.isCustom)
        }))
    };

    const getExercisesWithTabs = async () => {
        const rows = await drizzleDb
            .select({
                exerciseId: ExerciseTable.id,
                title: ExerciseTable.title,
                photo: ExerciseTable.photo,
                isCustom: ExerciseTable.isCustom,
                tabId: MuscleTagsTable.id,
                tabName: MuscleTagsTable.name,
                tabMuscleGroup: MuscleTagsTable.muscleGroup
            })
            .from(ExerciseTable)
            .leftJoin(ExerciseMuscleTagsTable, eq(ExerciseMuscleTagsTable.exerciseId, ExerciseTable.id))
            .leftJoin(MuscleTagsTable, eq(MuscleTagsTable.id, ExerciseMuscleTagsTable.tabId));

        const grouped = rows.reduce((acc, row) => {
            const { exerciseId, title, photo, isCustom, tabId, tabName, tabMuscleGroup } = row;
            if (!acc[exerciseId]) {
                acc[exerciseId] = { id: exerciseId, title, photo, isCustom: Boolean(isCustom), tabs: [] };
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


    return { getExercises, getExercisesWithTabs };
};
