import { useFormContext } from 'react-hook-form'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { Button } from 'react-native-paper';
import { View } from '@/components/Themed'
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { MuscleTagsSelection } from '@/components/AddExerciseForm/MuscleTagsSelection'
import { ExerciseTitleField } from '@/components/AddExerciseForm/ExerciseTitleField'
import { ExerciseImageUpload } from '@/components/AddExerciseForm/ExerciseImageUpload'

export const AddExerciseForm = () => {
    const {
        handleSubmit,
        formState: { isValid }
    } = useFormContext<AddExerciseFormValues>()

    const onSubmit = (data: AddExerciseFormValues) => {
        console.log("Form submitted:", data);
        // TODO: invalidate queries
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
