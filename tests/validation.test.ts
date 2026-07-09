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

    it('rejects invalid exercise titles and too many muscle tags', () => {
        const schema = exerciseFormSchema({ exercises: [] })

        expect(schema.safeParse({
            title: 'Bad <script>',
            muscleTags: [],
            isCustom: true
        }).success).toBe(false)

        expect(schema.safeParse({
            title: 'Cable Row',
            muscleTags: [1, 2, 3, 4],
            isCustom: true
        }).success).toBe(false)
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
    it('accepts a valid workout with notes and color', () => {
        const schema = workoutFormSchema({ workouts: [] })

        const result = schema.safeParse({
            title: 'Upper Body',
            notes: 'Pull, push, shoulders',
            color: '#ffffff'
        })

        expect(result.success).toBe(true)
    })

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

    it('allows the current workout title while editing', () => {
        const schema = workoutFormSchema({
            workouts: [{
                id: 1,
                title: 'Leg Day',
                lastWorkout: null,
                createdAt: new Date()
            }],
            initialTitle: 'Leg Day'
        })

        const result = schema.safeParse({
            title: 'Leg Day',
            notes: '',
            color: '#ffffff'
        })

        expect(result.success).toBe(true)
    })

    it('rejects overlong workout notes', () => {
        const schema = workoutFormSchema({ workouts: [] })

        const result = schema.safeParse({
            title: 'Leg Day',
            notes: 'x'.repeat(256),
            color: '#ffffff'
        })

        expect(result.success).toBe(false)
    })
})
