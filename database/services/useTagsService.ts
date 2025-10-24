import { useSQLiteContext } from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as schema from '@/database/schema'
import { MuscleTagsTable } from '@/database/schema'
import { MuscleGroup, MuscleTag } from '@/database/entities'

export const useTagsService = () => {
    const db = useSQLiteContext();
    const drizzleDb = drizzle(db, { schema });

    const getMuscleTags = async (): Promise<MuscleTag[]> => {
        const result = await drizzleDb.select().from(MuscleTagsTable)
        return result.map((tag) => ({
            ...tag,
            muscleGroup: tag.muscleGroup as MuscleGroup
        }))
    }

    return { getMuscleTags }
}