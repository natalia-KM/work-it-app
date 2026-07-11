import { Alert, FlatList, Image, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Appbar, Button, Card, Chip, List, Text } from 'react-native-paper'
import { useGetWorkout } from '@/hooks/workouts/useGetWorkout'
import { useGetWorkoutExercises } from '@/hooks/workouts/useGetWorkoutExercises'
import { ExerciseWorkoutDetails } from '@/database/entities'
import { getImageSource } from '@/components/utils/getImageSource'
import { DEFAULT_REST_TIMER_SECONDS, ExerciseProgressLog, useWorkoutProgressStore } from '@/store'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFinishWorkout } from '@/hooks/logs/useFinishWorkout'
import { StateView } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'
import { useDeleteActiveWorkoutDraft } from '@/hooks/workouts/useActiveWorkoutDraft'
import { usePersistActiveWorkoutDraft } from '@/hooks/workouts/usePersistActiveWorkoutDraft'

export default function CurrentWorkoutMainScreen() {
    usePersistActiveWorkoutDraft()
    const {
        workoutId,
        setWorkoutDetails,
        setCurrentExerciseId,
        exerciseData,
        setExerciseData,
        getSession,
        resetSession,
        hasSessionData
    } = useWorkoutProgressStore()
    const finishWorkout = useFinishWorkout()
    const deleteActiveDraft = useDeleteActiveWorkoutDraft()

    const { data: workout, isError } = useGetWorkout({
        workoutId,
        refetchOnMount: 'always',
        onSuccess: (workout) => {
            setWorkoutDetails(workout?.id, workout?.title)
        }
    })

    const { data: exercises } = useGetWorkoutExercises({
        workoutId, onSuccess: (data) => {
            if (exerciseData.length === 0) {
                const initialExercises: ExerciseProgressLog[] = data.map(item => {
                    return {
                        exerciseId: item.id,
                        details: [],
                        restTime: DEFAULT_REST_TIMER_SECONDS,
                        notes: item.notes ?? undefined,
                        bestAchieved: item.bestAchieved ?? undefined,
                        isOptional: item.isOptional
                    }
                })
                setExerciseData(initialExercises)
            }
        }
    })
    const router = useRouter()

    if (!workout || isError) {
        return (
            <StateView
                title="Could not load workout"
                description="The active workout could not be read."
                icon="alert-circle-outline"
            />
        )
    }

    const onExercisePress = (itemId: number) => {
        setCurrentExerciseId(itemId)
        router.replace({
            pathname: '/(workouts)/current-workout-exercise'
        })
    }

    const cancelWorkout = async () => {
        try {
            await deleteActiveDraft.mutateAsync()
            resetSession()
            router.replace('/(tabs)/workouts')
        } catch {
            Alert.alert('Could not discard workout', 'Please try again.')
        }
    }

    const handleCancel = () => {
        if (!hasSessionData()) {
            void cancelWorkout()
            return
        }

        Alert.alert(
            'Discard workout?',
            'Entered sets will be lost.',
            [
                { text: 'Keep Going', style: 'cancel' },
                { text: 'Discard', style: 'destructive', onPress: () => void cancelWorkout() }
            ]
        )
    }

    const handleFinishWorkout = async () => {
        const session = getSession()

        if (!session) {
            Alert.alert('Workout unavailable', 'Start the workout again before saving.')
            return
        }

        const incompleteRequiredExercises = session.exercises.filter((exercise) => {
            if (exercise.isOptional || exercise.completed || exercise.skipped) return false

            return !exercise.details.some((set) => set.isCompleted || set.weight > 0 || set.reps > 0)
        })

        if (incompleteRequiredExercises.length > 0) {
            Alert.alert(
                'Required exercises unfinished',
                'Complete or skip required exercises before finishing the workout.'
            )
            return
        }

        try {
            await finishWorkout.mutateAsync(session)
            await deleteActiveDraft.mutateAsync()
            resetSession()
            router.replace('/(tabs)/workouts')
        } catch {
            Alert.alert('Could not finish workout', 'Please try again.')
        }
    }

    const description = (item: ExerciseWorkoutDetails) => {
        const parts = []

        if (item.isOptional) parts.push('Optional')
        if (item.targetSets || item.targetReps || item.targetWeight) {
            parts.push(`Target: ${item.targetSets ?? '?'} x ${item.targetReps ?? '?'}${item.targetWeight ? ` @ ${item.targetWeight}kg` : ''}`)
        }
        if (item.lastCompleted) parts.push(`Last: ${item.lastCompleted.toLocaleDateString()}`)
        if (item.bestAchieved) parts.push(`Best score: ${item.bestAchieved}`)

        return parts.join(' | ')
    }

    const getExerciseState = (exerciseId: number) => {
        return exerciseData.find((exercise) => exercise.exerciseId === exerciseId)
    }

    const getStatusIcon = (exerciseId: number) => {
        const state = getExerciseState(exerciseId)

        if (state?.completed) return 'check-circle'
        if (state?.skipped) return 'minus-circle-outline'
        if (state?.details.some((set) => set.isCompleted || set.weight > 0 || set.reps > 0)) return 'progress-pencil'

        return 'checkbox-blank-circle-outline'
    }

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={handleCancel}/>
                <Appbar.Content title={workout.title}/>
                <Appbar.Action icon="close" onPress={handleCancel}/>
            </Appbar.Header>
            <SafeAreaView style={styles.screen}>
                <View style={styles.screenContainer}>
                    <View style={styles.hero}>
                        <Text variant="labelLarge" style={styles.eyebrow}>In progress</Text>
                        <Text variant="headlineSmall" style={styles.heroTitle}>{workout.title}</Text>
                        <Text variant="bodyMedium" style={styles.heroText}>Complete or skip required exercises before finishing.</Text>
                    </View>
                    <FlatList
                        data={exercises}
                        style={styles.list}
                        contentContainerStyle={styles.container}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }: { item: ExerciseWorkoutDetails }) => (
                            <Card mode="contained" style={styles.itemWrapper} onPress={() => onExercisePress(item.id)}>
                                <List.Item
                                    containerStyle={styles.itemContents}
                                    title={item.title}
                                    titleStyle={styles.itemTitle}
                                    description={() => (
                                        <View style={styles.metaRow}>
                                            {(description(item).split(' | ').filter(Boolean)).map((part) => (
                                                <Chip key={part} compact style={styles.metaChip}>{part}</Chip>
                                            ))}
                                        </View>
                                    )}
                                    left={props => <Image {...props} source={getImageSource(item.photo)}
                                                          style={styles.image}/>}
                                    right={props => <List.Icon {...props} icon={getStatusIcon(item.id)} color={palette.primary}/>}
                                />
                            </Card>
                        )}
                    />
                    <Button
                        mode="contained"
                        icon="flag-checkered"
                        contentStyle={styles.finishContent}
                        loading={finishWorkout.isPending}
                        disabled={finishWorkout.isPending}
                        onPress={handleFinishWorkout}
                    >
                        Finish Workout
                    </Button>
                </View>
            </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: palette.background,
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    screenContainer: {
        paddingVertical: 18,
        paddingHorizontal: 20,
        flex: 1,
        gap: 16
    },
    hero: {
        padding: 18,
        borderRadius: 8,
        backgroundColor: palette.primary,
        gap: 4
    },
    eyebrow: {
        color: '#D7F4EF',
        textTransform: 'uppercase'
    },
    heroTitle: {
        color: '#FFFFFF',
        fontWeight: '800'
    },
    heroText: {
        color: '#E8FFFB'
    },
    list: {
        flex: 1,
        width: '100%'
    },
    container: {
        paddingBottom: 4,
        gap: 12
    },
    itemContents: {
        alignItems: 'center',
        minHeight: 84
    },
    itemWrapper: {
        backgroundColor: palette.surface
    },
    itemTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    image: {
        width: 64,
        height: 64,
        marginRight: 8,
        borderRadius: 8,
        backgroundColor: palette.surfaceAlt
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        paddingTop: 4
    },
    metaChip: {
        backgroundColor: palette.surfaceAlt
    },
    finishContent: {
        minHeight: 50
    }
})
