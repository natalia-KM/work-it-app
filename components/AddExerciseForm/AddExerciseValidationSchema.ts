import { z } from 'zod'
import { ImagePickerAsset } from 'expo-image-picker'

export const formSchema = (exercises: { title: string }[]) => {
    return z.object({
        title: z.string()
            .min(2, { message: "Name must be at least 2 characters long" })
            .max(100, { message: "Name cannot exceed 100 characters" })
            .regex(
                /^[a-zA-Z0-9\s\-_,.!?]*$/,
                { message: "Name contains invalid characters" }
            )
            .refine(
                (value) => !exercises.some((ex) => ex.title.toLowerCase() === value.toLowerCase()),
                { message: "An exercise with this name already exists" }
            ),
        muscleTags: z.array(z.number()).max(3, { message: "You can select up to 3 muscle tags" }),
        photo: z.any().nullable().optional()
    })
}

export type AddExerciseFormValues = {
    title: string
    muscleTags: number[]
    photo?: ImagePickerAsset | null
}