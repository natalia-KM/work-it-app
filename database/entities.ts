export interface Exercise {
    id: number;
    title: string;
    photo?: string | null;
    isCustom: boolean;
}

export interface Tab {
    id: number
    name: string
}

export interface ExerciseTab extends Exercise {
    tabs: Tab[]
}