import { useGetWorkoutExercises } from '@/hooks/workouts/useGetWorkoutExercises'
import { Button, Card, List, Text } from 'react-native-paper'
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native'
import { NoItemsFound } from '@/components/NoItemsFound'
import { getImageSource } from '@/components/utils/getImageSource'
import { AddWorkoutExercisesButton } from '@/components/WorkoutExercises/AddWorkoutExercisesButton'
import { useRouter } from 'expo-router'
import { useWorkoutProgressStore } from '@/store/useWorkoutProgressStore'
import { palette } from '@/constants/theme'
import { StateView } from '@/components/ui/Screen'
import { useDeleteActiveWorkoutDraft, useGetActiveWorkoutDraft } from '@/hooks/workouts/useActiveWorkoutDraft'

interface WorkoutExercisesProps {
    workoutId: number
}

const formatDate = (date?: Date | null) => {
    if (!date) return 'Not completed'

    return date.toLocaleDateString()
}

export const WorkoutExercises = ({ workoutId }: WorkoutExercisesProps) => {
    const { data: exercises, isError: isExerciseError } = useGetWorkoutExercises({ workoutId })
    const { data: activeDraft, isLoading: isActiveDraftLoading } = useGetActiveWorkoutDraft()
    const deleteActiveDraft = useDeleteActiveWorkoutDraft()

    const { hydrateSession, resetSession, setWorkoutDetails } = useWorkoutProgressStore()
    const router = useRouter()

    const navigateToActiveWorkout = () => {
        router.navigate({
            pathname: '/(workouts)/current-workout-main'
        })
    }

    const resumeDraft = () => {
        if (!activeDraft) return

        hydrateSession(activeDraft)
        navigateToActiveWorkout()
    }

    const startFreshWorkout = async () => {
        try {
            if (activeDraft) {
                await deleteActiveDraft.mutateAsync()
            }

            resetSession()
            setWorkoutDetails(workoutId)
            navigateToActiveWorkout()
        } catch {
            Alert.alert('Could not start workout', 'The saved workout draft could not be cleared.')
        }
    }

    const handleStartWorkout = () => {
        if (!activeDraft) {
            void startFreshWorkout()
            return
        }

        const draftTitle = activeDraft.workoutTitle ?? 'saved workout'

        if (activeDraft.workoutId === workoutId) {
            Alert.alert(
                'Resume workout?',
                'There is a saved draft for this workout.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Start Over', style: 'destructive', onPress: () => void startFreshWorkout() },
                    { text: 'Resume', onPress: resumeDraft }
                ]
            )
            return
        }

        Alert.alert(
            'Active workout saved',
            `Resume ${draftTitle}, or discard it and start this workout?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Discard & Start', style: 'destructive', onPress: () => void startFreshWorkout() },
                { text: 'Resume Saved', onPress: resumeDraft }
            ]
        )
    }

    if (isExerciseError || !exercises) {
        return (
            <StateView
                title="Could not load exercises"
                description="This workout could not be read from local storage."
                icon="alert-circle-outline"
            />
        )
    }

    if (exercises.length === 0) {
        return (
            <NoItemsFound
                title={'This workout is empty'}
                description={'Start building your workout by adding exercises'}
                ActionButton={<AddWorkoutExercisesButton workoutId={workoutId}/>}
            />
        )
    }

    return (
        <View style={styles.area}>
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {exercises.map(exercise => (
                    <Card key={exercise.id} mode="contained" style={styles.card}>
                        <List.Accordion
                            title={exercise.title}
                            id={exercise.id.toString()}
                            style={styles.itemWrapper}
                            titleStyle={styles.itemTitle}
                            description={[
                                exercise.isOptional ? 'Optional' : 'Required',
                                exercise.targetSets || exercise.targetReps
                                    ? `${exercise.targetSets ?? '?'} x ${exercise.targetReps ?? '?'}${exercise.targetWeight ? ` @ ${exercise.targetWeight}kg` : ''}`
                                    : undefined
                            ].filter(Boolean).join(' | ')}
                            descriptionStyle={styles.itemDescription}
                            left={props => <Image {...props} source={getImageSource(exercise.photo)} style={styles.image}/>}
                        >
                            <View style={styles.exerciseSummary}>
                                <Text variant="bodyMedium" style={styles.summaryLine}>Last completed: {formatDate(exercise.lastCompleted)}</Text>
                                <Text variant="bodyMedium" style={styles.summaryLine}>Best set: {exercise.bestAchieved ?? 'Not recorded'}</Text>
                                {exercise.instructions ? <Text variant="bodyMedium" style={styles.summaryLine}>Setup: {exercise.instructions}</Text> : null}
                                {exercise.notes ? <Text variant="bodyMedium" style={styles.summaryLine}>Notes: {exercise.notes}</Text> : null}
                            </View>
                        </List.Accordion>
                    </Card>
                ))}
            </ScrollView>
            <Button
                mode="contained"
                icon="play"
                contentStyle={styles.startButtonContent}
                disabled={deleteActiveDraft.isPending || isActiveDraftLoading}
                loading={deleteActiveDraft.isPending || isActiveDraftLoading}
                onPress={handleStartWorkout}
            >
                Start workout
            </Button>
        </View>
    )
}

const styles = StyleSheet.create({
    area: {
        flex: 1,
        width: '100%',
        gap: 16
    },
    list: {
        flex: 1,
        width: '100%'
    },
    listContent: {
        gap: 12,
        paddingBottom: 12
    },
    itemWrapper: {
        backgroundColor: palette.surface,
        borderRadius: 8
    },
    card: {
        backgroundColor: palette.surface
    },
    itemTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    image: {
        width: 54,
        height: 54,
        marginRight: 6,
        marginLeft: 4,
        borderRadius: 8,
        backgroundColor: palette.surfaceAlt
    },
    itemDescription: {
        color: palette.muted
    },
    exerciseSummary: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 6
    },
    summaryLine: {
        color: palette.muted,
        lineHeight: 20
    },
    addButton: {
        marginBottom: 10
    },
    startButtonContent: {
        minHeight: 48
    }
})
