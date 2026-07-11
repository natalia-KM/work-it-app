import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { eq } from 'drizzle-orm'
import * as schema from '@/database/schema'
import { ActiveWorkoutDraftTable } from '@/database/schema'
import { ActiveWorkoutDraft, SaveActiveWorkoutDraftInput } from '@/store/types'

const ACTIVE_WORKOUT_DRAFT_ID = 1

export const useActiveWorkoutDraftService = () => {
    const db = useSQLiteContext();
    const drizzleDb = drizzle(db, { schema });

    const getActiveWorkoutDraft = async (): Promise<ActiveWorkoutDraft | undefined> => {
        const rows = await drizzleDb
            .select()
            .from(ActiveWorkoutDraftTable)
            .where(eq(ActiveWorkoutDraftTable.id, ACTIVE_WORKOUT_DRAFT_ID))
            .limit(1)

        return rows[0]
    }

    const saveActiveWorkoutDraft = async (draft: SaveActiveWorkoutDraftInput) => {
        const updatedAt = new Date()

        await drizzleDb
            .insert(ActiveWorkoutDraftTable)
            .values({
                id: ACTIVE_WORKOUT_DRAFT_ID,
                workoutId: draft.workoutId,
                workoutTitle: draft.workoutTitle,
                startedAt: draft.startedAt,
                exerciseData: draft.exerciseData,
                currentExerciseId: draft.currentExerciseId,
                currentExerciseDetails: draft.currentExerciseDetails,
                updatedAt
            })
            .onConflictDoUpdate({
                target: ActiveWorkoutDraftTable.id,
                set: {
                    workoutId: draft.workoutId,
                    workoutTitle: draft.workoutTitle,
                    startedAt: draft.startedAt,
                    exerciseData: draft.exerciseData,
                    currentExerciseId: draft.currentExerciseId,
                    currentExerciseDetails: draft.currentExerciseDetails,
                    updatedAt
                }
            })
    }

    const deleteActiveWorkoutDraft = async () => {
        await drizzleDb
            .delete(ActiveWorkoutDraftTable)
            .where(eq(ActiveWorkoutDraftTable.id, ACTIVE_WORKOUT_DRAFT_ID))
    }

    return {
        getActiveWorkoutDraft,
        saveActiveWorkoutDraft,
        deleteActiveWorkoutDraft
    }
}
