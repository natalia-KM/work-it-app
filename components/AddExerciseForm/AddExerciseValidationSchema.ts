import { z } from 'zod'
import { ImagePickerAsset } from 'expo-image-picker'

// TODO: add max 3 muscleTags constraint and title validation

export const formSchema = (exercises: { title: string }[]) => {
    return z.object({
        title: z.string()
            .min(2, { message: "Name must be at least 2 characters long" })
            .refine(
                (value) => !exercises.some((ex) => ex.title.toLowerCase() === value.toLowerCase()),
                { message: "An exercise with this name already exists" }
            ),
        muscleTags: z.array(z.number()),
        photo: z.any().nullable().optional()
    })
}

export type AddExerciseFormValues = {
    title: string
    muscleTags: number[]
    photo?: ImagePickerAsset | null
}