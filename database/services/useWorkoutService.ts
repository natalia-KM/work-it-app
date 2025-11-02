import { useSQLiteContext } from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as schema from '@/database/schema'
import { WorkoutTable } from '@/database/schema'
import { Workout } from '@/database/entities'

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

    return { getWorkouts, addWorkout }
}