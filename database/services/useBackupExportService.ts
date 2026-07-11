import { drizzle } from 'drizzle-orm/expo-sqlite'
import { useSQLiteContext } from 'expo-sqlite'
import * as schema from '@/database/schema'
import {
    ActiveWorkoutDraftTable,
    ExerciseMuscleTagsTable,
    ExerciseTable,
    MuscleTagsTable,
    WorkoutExerciseTable,
    WorkoutLogExerciseTable,
    WorkoutLogTable,
    WorkoutTable
} from '@/database/schema'
import { BackupExportData, createBackupExportPayload } from '@/database/backupExport'

export const useBackupExportService = () => {
    const db = useSQLiteContext()
    const drizzleDb = drizzle(db, { schema })

    const getBackupExportData = async (): Promise<BackupExportData> => {
        const [
            exercises,
            muscleTags,
            exerciseMuscleTags,
            workouts,
            workoutExercises,
            workoutLogs,
            workoutLogExercises,
            activeWorkoutDrafts
        ] = await Promise.all([
            drizzleDb.select().from(ExerciseTable),
            drizzleDb.select().from(MuscleTagsTable),
            drizzleDb.select().from(ExerciseMuscleTagsTable),
            drizzleDb.select().from(WorkoutTable),
            drizzleDb.select().from(WorkoutExerciseTable),
            drizzleDb.select().from(WorkoutLogTable),
            drizzleDb.select().from(WorkoutLogExerciseTable),
            drizzleDb.select().from(ActiveWorkoutDraftTable)
        ])

        return {
            exercises,
            muscleTags,
            exerciseMuscleTags,
            workouts,
            workoutExercises,
            workoutLogs,
            workoutLogExercises,
            activeWorkoutDraft: activeWorkoutDrafts[0] ?? null
        }
    }

    const createBackupExport = async () => {
        return createBackupExportPayload(await getBackupExportData())
    }

    return {
        getBackupExportData,
        createBackupExport
    }
}
