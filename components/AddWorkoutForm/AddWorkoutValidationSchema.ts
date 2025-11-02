import { z } from 'zod'
import { Workout } from '@/database/entities'

interface WorkoutFormSchemaArgs {
    /**
     * List of workouts to filter by
     */
    workouts: Workout[]

    /**
     * Initial title of the workout
     * Pass when in edit mode, for the schema to skip unique check
     */
    initialTitle?: string
}


export const formSchema = ({
    workouts,
    initialTitle
}: WorkoutFormSchemaArgs) => {
    return z.object({
        title: z.string()
            .min(2, { message: "Name must be at least 2 characters long" })
            .max(100, { message: "Name cannot exceed 100 characters" })
            .regex(
                /^[a-zA-Z0-9\s\-_,.!?]*$/,
                { message: "Name contains invalid characters" }
            )
            .refine(
                (value) => !workouts.some(
                    (ex) => ex.title.toLowerCase() === value.toLowerCase() && value !== initialTitle),
                { message: "A workout with this name already exists" }
            ),
        notes: z.string().max(255, { message: "Description cannot exceed 255 characters" }).optional()
    })
}

export type WorkoutFormValues = {
    title: string
    notes?: string
}