import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button, Card, HelperText, IconButton, Switch, Text, TextInput } from 'react-native-paper'
import { useGetWorkout } from '@/hooks/workouts/useGetWorkout'
import { useGetWorkoutExercises } from '@/hooks/workouts/useGetWorkoutExercises'
import { useGetWorkouts } from '@/hooks/workouts/useGetWorkouts'
import { useUpdateWorkoutTemplate } from '@/hooks/workouts/useUpdateWorkoutTemplate'
import { formSchema as workoutFormSchema } from '@/components/AddWorkoutForm/AddWorkoutValidationSchema'
import { ColorPicker } from '@/components/ColorPicker'
import { AppScreen, LoadingState, ScreenHeader, StateView } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'

interface TemplateWorkoutFields {
    title: string
    notes: string
    color: string
}

interface TemplateExerciseFields {
    exerciseId: number
    title: string
    isOptional: boolean
    targetSets: string
    targetReps: string
    targetWeight: string
    notes: string
}

const DEFAULT_WORKOUT_COLOR = '#4B0082'

const updateAt = <T,>(items: T[], index: number, updater: (item: T) => T) => {
    return items.map((item, itemIndex) => itemIndex === index ? updater(item) : item)
}

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
    const nextItems = [...items]
    const [item] = nextItems.splice(fromIndex, 1)
    nextItems.splice(toIndex, 0, item)
    return nextItems
}

const isBlankOrFiniteNumber = (value: string) => value.trim() === '' || Number.isFinite(Number(value))

const hasValidTargets = (exercise: TemplateExerciseFields) => {
    const sets = exercise.targetSets.trim()
    const reps = exercise.targetReps.trim()
    const weight = exercise.targetWeight.trim()

    const validSets = sets === '' || (Number.isInteger(Number(sets)) && Number(sets) > 0)
    const validReps = reps === '' || (Number.isInteger(Number(reps)) && Number(reps) > 0)
    const validWeight = weight === '' || (isBlankOrFiniteNumber(weight) && Number(weight) >= 0)

    return validSets && validReps && validWeight
}

export default function EditWorkoutTemplateScreen() {
    const { workoutId } = useLocalSearchParams<{ workoutId: string }>()
    const numericWorkoutId = Number(workoutId)
    const hasInitialized = useRef(false)

    const [workoutFields, setWorkoutFields] = useState<TemplateWorkoutFields>({
        title: '',
        notes: '',
        color: DEFAULT_WORKOUT_COLOR
    })
    const [templateExercises, setTemplateExercises] = useState<TemplateExerciseFields[]>([])
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

    const { data: workout, isError: isWorkoutError } = useGetWorkout({ workoutId: numericWorkoutId })
    const { data: exercises, isError: isExercisesError } = useGetWorkoutExercises({ workoutId: numericWorkoutId })
    const { data: workouts = [] } = useGetWorkouts()
    const updateWorkoutTemplate = useUpdateWorkoutTemplate()
    const router = useRouter()

    useEffect(() => {
        if (!workout || !exercises || hasInitialized.current) return

        setWorkoutFields({
            title: workout.title,
            notes: workout.notes ?? '',
            color: workout.color ?? DEFAULT_WORKOUT_COLOR
        })
        setTemplateExercises(exercises.map((exercise) => ({
            exerciseId: exercise.id,
            title: exercise.title,
            isOptional: exercise.isOptional,
            targetSets: exercise.targetSets?.toString() ?? '',
            targetReps: exercise.targetReps?.toString() ?? '',
            targetWeight: exercise.targetWeight?.toString() ?? '',
            notes: exercise.notes ?? ''
        })))
        hasInitialized.current = true
    }, [workout, exercises])

    const workoutValidation = useMemo(() => {
        return workoutFormSchema({
            workouts,
            initialTitle: workout?.title
        }).safeParse(workoutFields)
    }, [workoutFields, workout?.title, workouts])

    const targetInputsAreValid = useMemo(() => {
        return templateExercises.every(hasValidTargets)
    }, [templateExercises])

    const canSave = workoutValidation.success && targetInputsAreValid && !updateWorkoutTemplate.isPending

    const titleError = workoutValidation.success
        ? undefined
        : workoutValidation.error.flatten().fieldErrors.title?.[0]

    const notesError = workoutValidation.success
        ? undefined
        : workoutValidation.error.flatten().fieldErrors.notes?.[0]

    const updateExercise = (index: number, updater: (exercise: TemplateExerciseFields) => TemplateExerciseFields) => {
        setTemplateExercises((current) => updateAt(current, index, updater))
    }

    const moveExercise = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction
        if (targetIndex < 0 || targetIndex >= templateExercises.length) return

        setTemplateExercises((current) => moveItem(current, index, targetIndex))
    }

    const saveTemplate = async () => {
        if (!workout || !canSave) return

        try {
            await updateWorkoutTemplate.mutateAsync({
                workoutId: numericWorkoutId,
                title: workoutFields.title,
                notes: workoutFields.notes,
                color: workoutFields.color,
                exercises: templateExercises.map((exercise) => ({
                    exerciseId: exercise.exerciseId,
                    isOptional: exercise.isOptional,
                    targetSets: exercise.targetSets,
                    targetReps: exercise.targetReps,
                    targetWeight: exercise.targetWeight,
                    notes: exercise.notes
                }))
            })

            router.navigate({
                pathname: '/(tabs)/workouts',
                params: { targetWorkoutId: numericWorkoutId.toString() }
            })
        } catch (error) {
            Alert.alert('Template not saved', error instanceof Error ? error.message : 'Review the template and try again.')
        }
    }

    if (!workoutId || !Number.isFinite(numericWorkoutId)) {
        return (
            <StateView
                title="Could not edit template"
                description="The workout id is missing."
                icon="alert-circle-outline"
            />
        )
    }

    if (isWorkoutError || isExercisesError) {
        return (
            <StateView
                title="Could not load template"
                description="This workout template could not be read from local storage."
                icon="alert-circle-outline"
            />
        )
    }

    if (!workout || !exercises || !hasInitialized.current) {
        return <LoadingState title="Loading template"/>
    }

    return (
        <AppScreen contentStyle={styles.screenContent}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoider}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <ScreenHeader
                        eyebrow="Workout builder"
                        title="Edit template"
                        description="Adjust the plan used when starting this workout."
                    />

                    <View style={styles.workoutSection}>
                        <View style={styles.rowBetween}>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Workout details</Text>
                            <Pressable
                                onPress={() => setIsColorPickerOpen(true)}
                                accessibilityRole="button"
                                accessibilityLabel="Choose workout color"
                                style={[styles.colorSwatch, { backgroundColor: workoutFields.color }]}
                            />
                        </View>

                        <TextInput
                            label="Title"
                            mode="outlined"
                            value={workoutFields.title}
                            onChangeText={(title) => setWorkoutFields((current) => ({ ...current, title }))}
                            error={!!titleError}
                            style={styles.input}
                        />
                        {titleError ? <HelperText type="error">{titleError}</HelperText> : null}

                        <TextInput
                            label="Description"
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            value={workoutFields.notes}
                            onChangeText={(notes) => setWorkoutFields((current) => ({ ...current, notes }))}
                            error={!!notesError}
                            style={styles.input}
                        />
                        {notesError ? <HelperText type="error">{notesError}</HelperText> : null}
                    </View>

                    {isColorPickerOpen ? (
                        <ColorPicker
                            isOpen={isColorPickerOpen}
                            selectedColor={workoutFields.color}
                            setSelectedColor={(color) => setWorkoutFields((current) => ({ ...current, color }))}
                            onConfirm={(color) => {
                                setWorkoutFields((current) => ({ ...current, color }))
                                setIsColorPickerOpen(false)
                            }}
                        />
                    ) : null}

                    <View style={styles.exerciseList}>
                        <View style={styles.rowBetween}>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Exercises</Text>
                            <Text variant="labelLarge" style={styles.exerciseCount}>{templateExercises.length} total</Text>
                        </View>

                        {templateExercises.map((exercise, index) => {
                            const targetsAreValid = hasValidTargets(exercise)

                            return (
                                <Card key={exercise.exerciseId} mode="contained" style={styles.exerciseCard}>
                                    <Card.Content style={styles.exerciseContent}>
                                        <View style={styles.rowBetween}>
                                            <View style={styles.exerciseTitleBlock}>
                                                <Text variant="titleMedium" style={styles.exerciseTitle}>{exercise.title}</Text>
                                                <Text variant="bodySmall" style={styles.exercisePosition}>Position {index + 1}</Text>
                                            </View>
                                            <View style={styles.orderControls}>
                                                <IconButton
                                                    icon="arrow-up"
                                                    mode="contained-tonal"
                                                    size={18}
                                                    disabled={index === 0}
                                                    onPress={() => moveExercise(index, -1)}
                                                />
                                                <IconButton
                                                    icon="arrow-down"
                                                    mode="contained-tonal"
                                                    size={18}
                                                    disabled={index === templateExercises.length - 1}
                                                    onPress={() => moveExercise(index, 1)}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.rowBetween}>
                                            <Text style={styles.fieldLabel}>Optional exercise</Text>
                                            <Switch
                                                value={exercise.isOptional}
                                                onValueChange={(isOptional) => updateExercise(index, (item) => ({ ...item, isOptional }))}
                                            />
                                        </View>

                                        <View style={styles.targetRow}>
                                            <TextInput
                                                label="Sets"
                                                mode="outlined"
                                                keyboardType="numeric"
                                                value={exercise.targetSets}
                                                onChangeText={(targetSets) => updateExercise(index, (item) => ({ ...item, targetSets }))}
                                                style={styles.targetInput}
                                            />
                                            <TextInput
                                                label="Reps"
                                                mode="outlined"
                                                keyboardType="numeric"
                                                value={exercise.targetReps}
                                                onChangeText={(targetReps) => updateExercise(index, (item) => ({ ...item, targetReps }))}
                                                style={styles.targetInput}
                                            />
                                            <TextInput
                                                label="Weight"
                                                mode="outlined"
                                                keyboardType="decimal-pad"
                                                value={exercise.targetWeight}
                                                onChangeText={(targetWeight) => updateExercise(index, (item) => ({ ...item, targetWeight }))}
                                                style={styles.targetInput}
                                            />
                                        </View>
                                        {!targetsAreValid ? (
                                            <HelperText type="error">
                                                Sets and reps must be whole numbers above zero. Weight must be zero or more.
                                            </HelperText>
                                        ) : null}

                                        <TextInput
                                            label="Workout-specific notes"
                                            mode="outlined"
                                            multiline
                                            value={exercise.notes}
                                            onChangeText={(notes) => updateExercise(index, (item) => ({ ...item, notes }))}
                                            style={styles.input}
                                        />
                                    </Card.Content>
                                </Card>
                            )
                        })}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Button
                        mode="outlined"
                        icon="close"
                        onPress={() => router.back()}
                        disabled={updateWorkoutTemplate.isPending}
                        style={styles.footerButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        mode="contained"
                        icon="content-save-outline"
                        onPress={saveTemplate}
                        loading={updateWorkoutTemplate.isPending}
                        disabled={!canSave}
                        style={styles.footerButton}
                    >
                        Save
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </AppScreen>
    )
}

const styles = StyleSheet.create({
    screenContent: {
        paddingHorizontal: 0,
        paddingVertical: 0
    },
    keyboardAvoider: {
        flex: 1
    },
    container: {
        padding: 20,
        gap: 18,
        paddingBottom: 96
    },
    workoutSection: {
        gap: 10,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: palette.line,
        backgroundColor: palette.surface
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
    },
    sectionTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    colorSwatch: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 2,
        borderColor: palette.line
    },
    input: {
        backgroundColor: palette.surface
    },
    exerciseList: {
        gap: 12
    },
    exerciseCount: {
        color: palette.muted
    },
    exerciseCard: {
        backgroundColor: palette.surface
    },
    exerciseContent: {
        gap: 12
    },
    exerciseTitleBlock: {
        flex: 1,
        gap: 2
    },
    exerciseTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    exercisePosition: {
        color: palette.muted
    },
    orderControls: {
        flexDirection: 'row'
    },
    fieldLabel: {
        color: palette.ink,
        fontWeight: '600'
    },
    targetRow: {
        flexDirection: 'row',
        gap: 8
    },
    targetInput: {
        flex: 1
    },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
        borderColor: palette.line,
        backgroundColor: palette.surface
    },
    footerButton: {
        flex: 1
    }
})
