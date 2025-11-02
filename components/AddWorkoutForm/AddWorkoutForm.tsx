import { KeyboardAvoidingView, Platform } from 'react-native'
import { styles } from '@/components/AddWorkoutForm/styles'
import { Controller, useForm } from 'react-hook-form'
import { formSchema, WorkoutFormValues } from '@/components/AddWorkoutForm/AddWorkoutValidationSchema'
import { Button, HelperText, TextInput } from 'react-native-paper'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGetWorkouts } from '@/hooks/workouts/useGetWorkouts'
import { useCreateWorkout } from '@/hooks/workouts/useCreateWorkout'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { View } from '@/components/Themed'

export const AddWorkoutForm = () => {
    const { data: workouts = [] } = useGetWorkouts()
    const { mutateAsync: createWorkout } = useCreateWorkout()

    const {
        control,
        handleSubmit,
        formState
    } = useForm<WorkoutFormValues>({
        resolver: zodResolver(formSchema({ workouts })),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            title: ''
        }
    });

    const router = useRouter()
    const queryClient = useQueryClient()

    const onSubmit = async (data: WorkoutFormValues) => {
        await createWorkout(data)
            .then(() => {
                router.navigate('/workouts')
                queryClient.invalidateQueries({ queryKey: ['workouts'] })
            })
            .catch((error) => {
                alert('Error creating a workout')
                console.error(error)
            })
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // different handling per OS
        >
            <View>
                <Controller
                    name={'title'}
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="Title"
                            mode="outlined"
                            error={!!formState.errors.title}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                        />
                    )}
                />
                {formState.errors.title?.message &&
                    <HelperText type={'error'}>{formState.errors.title.message}</HelperText>}
            </View>

            <View>
                <Controller
                    name={'notes'}
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="Description"
                            mode="outlined"
                            multiline={true}
                            numberOfLines={3}
                            error={!!formState.errors.notes}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                        />
                    )}
                />
                {formState.errors.notes?.message &&
                    <HelperText type={'error'}>{formState.errors.notes.message}</HelperText>}
            </View>

            <Button
                mode={'contained'}
                style={styles.submitButton}
                disabled={!formState.isValid}
                onPress={handleSubmit(onSubmit)}
            >
                Create
            </Button>
        </KeyboardAvoidingView>
    )
}