import { Exercise } from '@/database/entities'

export interface ExerciseListProps {
    searchQuery?: string
    onSelectExercise?: (exercise: Exercise) => void;
}
