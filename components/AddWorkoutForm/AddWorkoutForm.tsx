import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native'
import { styles } from '@/components/AddWorkoutForm/styles'
import { Controller, useForm } from 'react-hook-form'
import { formSchema, WorkoutFormValues } from '@/components/AddWorkoutForm/AddWorkoutValidationSchema'
import { Button, HelperText, Text, TextInput } from 'react-native-paper'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGetWorkouts } from '@/hooks/workouts/useGetWorkouts'
import { useCreateWorkout } from '@/hooks/workouts/useCreateWorkout'
import { useRouter } from 'expo-router'
import { ColorPicker } from '@/components/ColorPicker'
import { useState } from 'react'
import { palette } from '@/constants/theme'

interface AddWorkoutFormProps {
    onClose: () => void
}

export const AddWorkoutForm = ({ onClose }: AddWorkoutFormProps) => {
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
    const [selectedColor, setSelectedColor] = useState('#4B0082')

    const { data: workouts = [] } = useGetWorkouts()
    const { mutateAsync: createWorkout } = useCreateWorkout()

    const {
        control,
        handleSubmit,
        formState,
        setValue
    } = useForm<WorkoutFormValues>({
        resolver: zodResolver(formSchema({ workouts })),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            title: '',
            color: selectedColor
        }
    });

    const router = useRouter()

    const onSubmit = async (data: WorkoutFormValues) => {
        await createWorkout(data)
            .then(() => {
                router.navigate('/workouts')
            })
            .catch((error) => {
                alert('Error creating a workout')
                console.error(error)
            })
            .finally(() => {
                onClose()
            })
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // different handling per OS
        >
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text variant="titleLarge" style={styles.title}>Create workout</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>Give it a name and color so it is easy to spot later.</Text>
                </View>
                <Pressable
                    onPress={() => setIsColorPickerOpen(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Choose workout color"
                    style={[styles.colorSwatch, { backgroundColor: selectedColor ?? palette.primary }]}
                />
            </View>

            {isColorPickerOpen && (
                <ColorPicker
                    isOpen={isColorPickerOpen}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    onConfirm={(color) => {
                        setValue('color', color)
                        setIsColorPickerOpen(false)
                    }}
                />
            )}

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
                icon="check"
                style={styles.submitButton}
                disabled={!formState.isValid}
                onPress={handleSubmit(onSubmit)}
            >
                Create
            </Button>
        </KeyboardAvoidingView>
    )
}
