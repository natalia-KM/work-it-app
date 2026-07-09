import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite'
import { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core'
import { ExerciseMuscleTagsTable, ExerciseTable, MuscleTagsTable } from '@/database/schema'
import {
    predefinedExerciseMuscleTags,
    predefinedExercises,
    predefinedMuscleTags
} from '@/database/seeds/predefinedExercises'

/**
 * Generic seeder helper
 * @param db - Drizzle DB instance
 * @param table - Drizzle table object
 * @param predefinedValues - Array of values to insert
 * @param key - field to check for uniqueness
 */
export async function seedIfEmpty<
    TTable extends SQLiteTableWithColumns<any>,
    TValue extends Record<string, any>
>(
    db: ExpoSQLiteDatabase,
    table: TTable,
    predefinedValues: TValue[],
    key: keyof TValue
) {
    const existing: TValue[] = await db.select().from(table);
    const existingKeys = existing.map((e) => e[key]);
    const newItems = predefinedValues.filter((v) => !existingKeys.includes(v[key]));

    if (newItems.length > 0) {
        await db.insert(table).values(newItems);
    }
}

/**
 * Seed a relationship table only if the combination of keys doesn't already exist.
 *
 * @template T - The type of the items in the data array.
 * @param {ExpoSQLiteDatabase} db - The Drizzle database instance.
 * @param {any} table - The Drizzle table object to insert into.
 * @param {T[]} data - Array of rows to insert.
 * @param {(row: T) => string} getKey - Function to generate a unique key for each row. Typically a combination of relevant IDs.
 */
export async function seedRelationshipIfEmpty<T>(
    db: ExpoSQLiteDatabase,
    table: any,
    data: T[],
    getKey: (row: T) => string
) {
    const existingRows = await db.select().from(table);
    const existingKeys = new Set(existingRows.map(getKey));

    const newRows = data.filter(row => !existingKeys.has(getKey(row)));
    if (newRows.length > 0) {
        await db.insert(table).values(newRows);
    }
}

export const seedDatabase = async (drizzleDb: ExpoSQLiteDatabase) => {
    try {
        await seedIfEmpty(drizzleDb, ExerciseTable, predefinedExercises, "title");
        await seedIfEmpty(drizzleDb, MuscleTagsTable, predefinedMuscleTags, "name");

        const [exercises, muscleTags] = await Promise.all([
            drizzleDb.select().from(ExerciseTable),
            drizzleDb.select().from(MuscleTagsTable)
        ])
        const exerciseIdsByTitle = new Map(exercises.map((exercise) => [exercise.title, exercise.id]))
        const tagIdsByName = new Map(muscleTags.map((tag) => [tag.name, tag.id]))
        const exerciseMuscleTags = predefinedExerciseMuscleTags
            .map(({ exerciseTitle, tagName }) => {
                const exerciseId = exerciseIdsByTitle.get(exerciseTitle)
                const tabId = tagIdsByName.get(tagName)

                if (!exerciseId || !tabId) return undefined

                return { exerciseId, tabId }
            })
            .filter((row): row is { exerciseId: number; tabId: number } => Boolean(row))

        await seedRelationshipIfEmpty(drizzleDb, ExerciseMuscleTagsTable, exerciseMuscleTags, (row) => `${row.exerciseId}_${row.tabId}`)
    } catch (e) {
        console.error('Error seeding the database: ', e)
    }
}
