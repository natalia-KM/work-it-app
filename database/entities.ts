export interface Exercise {
    id: number;
    title: string;
    photo?: string | null;
    isCustom: boolean;
}

export enum MuscleGroup {
    UpperBody = "Upper Body",
    LowerBody = "Lower Body",
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