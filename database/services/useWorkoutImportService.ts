import { drizzle } from 'drizzle-orm/expo-sqlite'
import { useSQLiteContext } from 'expo-sqlite'
import * as schema from '@/database/schema'
import { WorkoutNotesImport } from '@/database/importTypes'
import { saveWorkoutNotesImport } from '@/database/services/importWorkoutNotes'

export const useWorkoutImportService = () => {
    const db = useSQLiteContext()
    const drizzleDb = drizzle(db, { schema })

    const saveImport = async (parsedImport: WorkoutNotesImport) => {
        return saveWorkoutNotesImport(drizzleDb, parsedImport)
    }

    return { saveImport }
}

