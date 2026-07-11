import { describe, expect, it } from 'vitest'
import {
    cleanTemplateText,
    normalizeWorkoutTemplateExercises
} from '@/database/services/workoutTemplateMapper'

describe('workout template mapper', () => {
    it('normalizes exercise template values for persistence', () => {
        const result = normalizeWorkoutTemplateExercises([
            {
                exerciseId: 10,
                isOptional: true,
                targetSets: '3',
                targetReps: '8',
                targetWeight: '42.5',
                notes: '  Seat low  '
            },
            {
                exerciseId: 20,
                isOptional: false,
                targetSets: '',
                targetReps: null,
                targetWeight: '-1',
                notes: '   '
            }
        ])

        expect(result).toEqual([
            {
                exerciseId: 10,
                isOptional: 1,
                sortOrder: 0,
                targetSets: 3,
                targetReps: 8,
                targetWeight: 42.5,
                notes: 'Seat low'
            },
            {
                exerciseId: 20,
                isOptional: 0,
                sortOrder: 1,
                targetSets: null,
                targetReps: null,
                targetWeight: null,
                notes: null
            }
        ])
    })

    it('assigns sort order from the submitted exercise order', () => {
        const result = normalizeWorkoutTemplateExercises([
            { exerciseId: 3, isOptional: false },
            { exerciseId: 1, isOptional: false },
            { exerciseId: 2, isOptional: true }
        ])

        expect(result.map((exercise) => ({
            exerciseId: exercise.exerciseId,
            sortOrder: exercise.sortOrder
        }))).toEqual([
            { exerciseId: 3, sortOrder: 0 },
            { exerciseId: 1, sortOrder: 1 },
            { exerciseId: 2, sortOrder: 2 }
        ])
    })

    it('cleans blank template text to null', () => {
        expect(cleanTemplateText('  setup cue  ')).toBe('setup cue')
        expect(cleanTemplateText('   ')).toBeNull()
        expect(cleanTemplateText(null)).toBeNull()
    })
})
