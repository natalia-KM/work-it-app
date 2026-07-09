export interface Exercise {
    id: number;
    title: string;
    photo?: string | null;
    isCustom: boolean;
}

export enum MuscleGroup {
    UpperBody = "Upper",
    LowerBody = "Lower",
    Core = "Core",
}

export interface MuscleTag {
    id: number
    name: string
    muscleGroup: MuscleGroup
}

export interface ExerciseDetails extends Exercise {
    tabs: MuscleTag[]
}

export interface Workout {
    id: number;
    title: string;
    notes?: string | null;
    color?: string | null
    lastWorkout: Date | null;
    createdAt: Date;
}

export interface ExerciseWorkoutDetails extends Exercise {
    isArchived: boolean;
    bestAchieved?: number | null
    lastCompleted?: Date | null
    notes?: string | null;
}

export interface ExerciseLogDetails {
    /**
     * ID of a set. Can be used to determine order and number of sets
     */
    set: number,

    /**
     * Weight for the current set
     */
    weight: number,

    /**
     * Number of reps for the current set
     */
    reps: number
}

export interface ExerciseLog {
    logId: number;
    date: Date | null;
    duration: number | null;
    exerciseLogId: number;
    details: ExerciseLogDetails[] | null;
    notes: string | null;
    restTime: number;
    bestAchieved: number | null;
}