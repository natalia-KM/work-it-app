import { useFormContext } from 'react-hook-form'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { Button } from 'react-native-paper';
import { View } from '@/components/Themed'
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { MuscleTagsSelection } from '@/components/AddExerciseForm/MuscleTagsSelection'
import { ExerciseTitleField } from '@/components/AddExerciseForm/ExerciseTitleField'
import { ExerciseImageUpload } from '@/components/AddExerciseForm/ExerciseImageUpload'
import { useCreateExercise } from '@/hooks/exercises/useCreateExercise'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'

export const AddExerciseForm = () => {
    const {
        handleSubmit,
        formState: { isValid }
    } = useFormContext<AddExerciseFormValues>()

    const { mutateAsync: createExercise } = useCreateExercise()

    const router = useRouter();
    const queryClient = useQueryClient()

    const onSubmit = async (data: AddExerciseFormValues) => {
        await createExercise(data)
            .then(() => {
                router.navigate('/exercises')
                queryClient.invalidateQueries({ queryKey: ['exercises'] })
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
                style={styles.submitButton}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid}
            >
                Create
            </Button>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        height: '100%',
        gap: 20
    },
    content: {
        flexGrow: 1,
        gap: 20
    },
    submitButton: {
        marginBottom: 10
    }
});
