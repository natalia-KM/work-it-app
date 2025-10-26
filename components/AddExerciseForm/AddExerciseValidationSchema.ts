import { z } from 'zod'
import { Exercise } from '@/database/entities'

interface ExerciseFormSchemaArgs {
    /**
     * List of exercises to filter by
     */
    exercises: Exercise[]

    /**
     * Initial title of the exercise
     * Pass when in edit mode, for the schema to skip unique check
     */
    initialTitle?: string
}

export const formSchema = ({
    exercises,
    initialTitle
}: ExerciseFormSchemaArgs) => {
    return z.object({
        title: z.string()
            .min(2, { message: "Name must be at least 2 characters long" })
            .max(100, { message: "Name cannot exceed 100 characters" })
            .regex(
                /^[a-zA-Z0-9\s\-_,.!?]*$/,
                { message: "Name contains invalid characters" }
            )
            .refine(
                (value) => !exercises.some(
                    (ex) => ex.title.toLowerCase() === value.toLowerCase() && value !== initialTitle),
                { message: "An exercise with this name already exists" }
            ),
        muscleTags: z.array(z.number()).max(3, { message: "You can select up to 3 muscle tags" }),
        photo: z.string().optional().nullable(),
        isCustom: z.boolean().optional().default(false)
    })
}

export type AddExerciseFormValues = {
    title: string
    muscleTags: number[]
    photo?: string | null
    isCustom?: boolean
}