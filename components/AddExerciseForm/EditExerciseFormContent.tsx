import { KeyboardAvoidingView, Platform } from 'react-native'
import { View } from '@/components/Themed'
import { ExerciseImageUpload } from '@/components/AddExerciseForm/ExerciseImageUpload'
import { ExerciseTitleField } from '@/components/AddExerciseForm/ExerciseTitleField'
import { MuscleTagsSelection } from '@/components/AddExerciseForm/MuscleTagsSelection'
import { Button } from 'react-native-paper'
import { styles } from '@/components/AddExerciseForm/styles'
import { useFormContext } from 'react-hook-form'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { useUpdateExercise } from '@/hooks/exercises/useUpdateExercise'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'

interface EditExerciseFormContentProps {
    exerciseId: number
}

export const EditExerciseFormContent = ({ exerciseId }: EditExerciseFormContentProps) => {
    const { mutateAsync: updateExercise } = useUpdateExercise()

    const {
        handleSubmit,
        formState: { isValid, isDirty }
    } = useFormContext<AddExerciseFormValues>()

    const router = useRouter()
    const queryClient = useQueryClient()

    const onSubmit = async (data: AddExerciseFormValues) => {
        await updateExercise({ exerciseId, data })
            .then(() => {
                router.navigate('/exercises')
                queryClient.invalidateQueries({ queryKey: ['exercise', exerciseId] })
            })
            .catch((error) => {
                alert('Error updating an exercise')
                console.error(error)
            })
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // different handling per OS
        >
            <View style={styles.content}>
                <ExerciseImageUpload/>

                <ExerciseTitleField/>

                <MuscleTagsSelection/>
            </View>


            <Button
                mode={'contained'}
                style={styles.submitButton}
                onPress={handleSubmit(onSubmit)}
                disabled={!isDirty || !isValid}
            >
                Update
            </Button>

        </KeyboardAvoidingView>
    )
}