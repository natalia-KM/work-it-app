import { Exercise } from '@/database/entities'

export interface ExerciseListProps {
    onSelectExercise?: (exercise: Exercise) => void;
}
