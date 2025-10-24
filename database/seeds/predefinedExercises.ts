import { Exercise, MuscleGroup, MuscleTag } from '@/database/entities'

export const predefinedExercises: Exercise[] = [
    { id: 1, title: 'Squat', isCustom: false },
    { id: 2, title: 'Bench Press', isCustom: false },
    { id: 3, title: 'Deadlift', isCustom: false }
];

export const predefinedMuscleTags: MuscleTag[] = [
    // Lower Body
    { id: 1, name: "Glutes", muscleGroup: MuscleGroup.LowerBody },
    { id: 2, name: "Hamstrings", muscleGroup: MuscleGroup.LowerBody },
    { id: 3, name: "Quadriceps", muscleGroup: MuscleGroup.LowerBody },
    { id: 4, name: "Calves", muscleGroup: MuscleGroup.LowerBody },
    { id: 5, name: "Adductors", muscleGroup: MuscleGroup.LowerBody },
    { id: 6, name: "Abductors", muscleGroup: MuscleGroup.LowerBody },

    // Upper Body
    { id: 7, name: "Chest", muscleGroup: MuscleGroup.UpperBody },
    { id: 8, name: "Back", muscleGroup: MuscleGroup.UpperBody },
    { id: 9, name: "Lats", muscleGroup: MuscleGroup.UpperBody },
    { id: 10, name: "Shoulders", muscleGroup: MuscleGroup.UpperBody },
    { id: 11, name: "Triceps", muscleGroup: MuscleGroup.UpperBody },
    { id: 12, name: "Biceps", muscleGroup: MuscleGroup.UpperBody },
    { id: 13, name: "Forearms", muscleGroup: MuscleGroup.UpperBody },
    { id: 14, name: "Traps", muscleGroup: MuscleGroup.UpperBody },

    // Core
    { id: 15, name: "Abs", muscleGroup: MuscleGroup.Core },
    { id: 16, name: "Obliques", muscleGroup: MuscleGroup.Core },
    { id: 17, name: "Lower Back", muscleGroup: MuscleGroup.Core }
]

export const predefinedExerciseMuscleTags = [
    { exerciseId: 1, tabId: 1 }, // Squat → Glutes
    { exerciseId: 1, tabId: 2 }, // Squat → Hamstrings
    { exerciseId: 2, tabId: 7 }, // Bench Press → Chest
    { exerciseId: 2, tabId: 10 }, // Bench Press → Shoulders
    { exerciseId: 3, tabId: 8 }, // Deadlift → Back
    { exerciseId: 3, tabId: 9 } // Deadlift → Lats
]