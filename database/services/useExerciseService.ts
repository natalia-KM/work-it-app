import * as schema from "@/database/schema";
import { ExerciseTable, ExerciseTabsTable, TabsTable } from "@/database/schema";
import { useSQLiteContext } from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { Exercise, ExerciseTab } from '@/database/entities'
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
                tabId: TabsTable.id,
                tabName: TabsTable.name
            })
            .from(ExerciseTable)
            .leftJoin(ExerciseTabsTable, eq(ExerciseTabsTable.exerciseId, ExerciseTable.id))
            .leftJoin(TabsTable, eq(TabsTable.id, ExerciseTabsTable.tabId));

        const grouped = rows.reduce((acc, row) => {
            const { exerciseId, title, photo, isCustom, tabId, tabName } = row;
            if (!acc[exerciseId]) {
                acc[exerciseId] = { id: exerciseId, title, photo, isCustom: Boolean(isCustom), tabs: [] };
            }
            if (tabId && tabName) acc[exerciseId].tabs.push({ id: tabId, name: tabName });
            return acc;
        }, {} as Record<number, ExerciseTab>);

        return Object.values(grouped);
    }


    return { getExercises, getExercisesWithTabs };
};
