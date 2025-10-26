import { FormProvider, useForm } from 'react-hook-form'
import { AddExerciseFormValues, formSchema } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Exercise, ExerciseDetails } from '@/database/entities'
import { EditExerciseFormContent } from '@/components/AddExerciseForm/EditExerciseFormContent'

interface EditExerciseFormProps {
    exercises: Exercise[]
    exerciseData: ExerciseDetails
}

export const EditExerciseForm = ({ exercises, exerciseData }: EditExerciseFormProps) => {

    const methods = useForm<AddExerciseFormValues>({
        resolver: zodResolver(formSchema({ exercises, initialTitle: exerciseData.title })),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            title: exerciseData.title,
            muscleTags: exerciseData.tabs
                    .map(tab => tab.id)
                    .sort((a, b) => a - b)
                ?? [],
            photo: exerciseData.photo ?? null,
            isCustom: exerciseData.isCustom
        }
    });

    return (
        <FormProvider {...methods}>
            <EditExerciseFormContent exerciseId={exerciseData.id}/>
        </FormProvider>
    )
}