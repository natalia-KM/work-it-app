import { describe, expect, it } from 'vitest'
import { workoutImportJsonSchema } from '../server/workoutImportSchema.mjs'

describe('workout import API schema', () => {
    it('requires the top-level import review fields', () => {
        expect(workoutImportJsonSchema.additionalProperties).toBe(false)
        expect(workoutImportJsonSchema.required).toEqual([
            'sourceName',
            'summary',
            'warnings',
            'workouts'
        ])
    })

    it('requires normalized exercises and historical log rows', () => {
        const exerciseSchema = workoutImportJsonSchema
            .properties.workouts
            .items
            .properties.exercises
            .items

        expect(exerciseSchema.required).toEqual([
            'title',
            'instructions',
            'notes',
            'isOptional',
            'sortOrder',
            'targetSets',
            'targetReps',
            'targetWeight',
            'logs'
        ])

        const logSchema = exerciseSchema.properties.logs.items
        expect(logSchema.properties.date.pattern).toBe('^\\d{4}-\\d{2}-\\d{2}$')
        expect(logSchema.properties.sets.minItems).toBe(1)
    })
})

