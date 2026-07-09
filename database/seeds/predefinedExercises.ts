import { Exercise, MuscleGroup, MuscleTag } from '@/database/entities'

export const predefinedExercises: Omit<Exercise, 'id'>[] = [
    { title: 'Squat', isCustom: false },
    { title: 'Bench Press', isCustom: false },
    { title: 'Deadlift', isCustom: false }
];

export const predefinedMuscleTags: Omit<MuscleTag, 'id'>[] = [
    // Lower Body
    { name: "Glutes", muscleGroup: MuscleGroup.LowerBody },
    { name: "Hamstrings", muscleGroup: MuscleGroup.LowerBody },
    { name: "Quadriceps", muscleGroup: MuscleGroup.LowerBody },
    { name: "Calves", muscleGroup: MuscleGroup.LowerBody },
    { name: "Adductors", muscleGroup: MuscleGroup.LowerBody },
    { name: "Abductors", muscleGroup: MuscleGroup.LowerBody },

    // Upper Body
    { name: "Chest", muscleGroup: MuscleGroup.UpperBody },
    { name: "Back", muscleGroup: MuscleGroup.UpperBody },
    { name: "Lats", muscleGroup: MuscleGroup.UpperBody },
    { name: "Shoulders", muscleGroup: MuscleGroup.UpperBody },
    { name: "Triceps", muscleGroup: MuscleGroup.UpperBody },
    { name: "Biceps", muscleGroup: MuscleGroup.UpperBody },
    { name: "Forearms", muscleGroup: MuscleGroup.UpperBody },
    { name: "Traps", muscleGroup: MuscleGroup.UpperBody },

    // Core
    { name: "Abs", muscleGroup: MuscleGroup.Core },
    { name: "Obliques", muscleGroup: MuscleGroup.Core },
    { name: "Lower Back", muscleGroup: MuscleGroup.Core }
]

export const predefinedExerciseMuscleTags = [
    { exerciseTitle: 'Squat', tagName: 'Glutes' },
    { exerciseTitle: 'Squat', tagName: 'Hamstrings' },
    { exerciseTitle: 'Bench Press', tagName: 'Chest' },
    { exerciseTitle: 'Bench Press', tagName: 'Shoulders' },
    { exerciseTitle: 'Deadlift', tagName: 'Back' },
    { exerciseTitle: 'Deadlift', tagName: 'Lats' }
]
