import { useFormContext } from 'react-hook-form'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { Button } from 'react-native-paper';
import { View } from '@/components/Themed'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { MuscleTagsSelection } from '@/components/AddExerciseForm/MuscleTagsSelection'
import { ExerciseTitleField } from '@/components/AddExerciseForm/ExerciseTitleField'
import { ExerciseImageUpload } from '@/components/AddExerciseForm/ExerciseImageUpload'
import { useCreateExercise } from '@/hooks/exercises/useCreateExercise'
import { useRouter } from 'expo-router'
import { styles } from '@/components/AddExerciseForm/styles'

export const AddExerciseForm = () => {
    const {
        handleSubmit,
        formState: { isValid }
    } = useFormContext<AddExerciseFormValues>()

    const { mutateAsync: createExercise } = useCreateExercise()

    const router = useRouter()

    const onSubmit = async (data: AddExerciseFormValues) => {
        await createExercise(data)
            .then(() => {
                router.navigate('/exercises')
            })
            .catch((error) => {
                alert('Error creating an exercise')
                console.error(error)
            })
    };

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
                icon="check"
                style={styles.submitButton}
                contentStyle={styles.submitContent}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid}
            >
                Create
            </Button>
        </KeyboardAvoidingView>
    )
}
