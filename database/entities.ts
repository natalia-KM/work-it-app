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
    lastWorkout: Date | null;
    createdAt: Date;
}