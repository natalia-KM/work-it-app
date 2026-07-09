import { describe, expect, it } from 'vitest'
import { formSchema as exerciseFormSchema } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { formSchema as workoutFormSchema } from '@/components/AddWorkoutForm/AddWorkoutValidationSchema'

describe('exercise validation', () => {
    it('accepts a unique custom exercise title and up to three muscle tags', () => {
        const schema = exerciseFormSchema({
            exercises: [{ id: 1, title: 'Squat', isCustom: false }]
        })

        const result = schema.safeParse({
            title: 'Incline Press',
            muscleTags: [1, 2, 3],
            photo: null,
            isCustom: true
        })

        expect(result.success).toBe(true)
    })

    it('rejects duplicate exercise titles case-insensitively', () => {
        const schema = exerciseFormSchema({
            exercises: [{ id: 1, title: 'Squat', isCustom: false }]
        })

        const result = schema.safeParse({
            title: 'squat',
            muscleTags: [],
            isCustom: true
        })

        expect(result.success).toBe(false)
    })

    it('allows the current title while editing an exercise', () => {
        const schema = exerciseFormSchema({
            exercises: [{ id: 1, title: 'Squat', isCustom: false }],
            initialTitle: 'Squat'
        })

        const result = schema.safeParse({
            title: 'Squat',
            muscleTags: [],
            isCustom: true
        })

        expect(result.success).toBe(true)
    })
})

describe('workout validation', () => {
    it('rejects duplicate workout titles case-insensitively', () => {
        const schema = workoutFormSchema({
            workouts: [{
                id: 1,
                title: 'Leg Day',
                lastWorkout: null,
                createdAt: new Date()
            }]
        })

        const result = schema.safeParse({
            title: 'leg day',
            notes: 'duplicate',
            color: '#ffffff'
        })

        expect(result.success).toBe(false)
    })
})
