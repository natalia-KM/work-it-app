import { z } from 'zod'

export const formSchema = (exercises: { title: string }[]) => {
    return z.object({
        title: z.string()
            .min(2, { message: "Name must be at least 2 characters long" })
            .refine(
                (value) => !exercises.some((ex) => ex.title.toLowerCase() === value.toLowerCase()),
                { message: "An exercise with this name already exists" }
            )
    })
}

export type AddExerciseFormValues = z.infer<ReturnType<typeof formSchema>>