import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router'
import { Appbar, Button, List } from 'react-native-paper'
import { useGetWorkout } from '@/hooks/workouts/useGetWorkout'
import { useGetWorkoutExercises } from '@/hooks/workouts/useGetWorkoutExercises'
import { Alert, FlatList, Image, StyleSheet } from 'react-native'
import { ExerciseWorkoutDetails } from '@/database/entities'
import { getImageSource } from '@/components/utils/getImageSource'
import { ExerciseProgressLog, useWorkoutProgressStore } from '@/store'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFinishWorkout } from '@/hooks/logs/useFinishWorkout'

export default function CurrentWorkoutMainScreen() {
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
                        restTime: 0,
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
        return <Text>Something went wrong...</Text>
    }

    const onExercisePress = (itemId: number) => {
        setCurrentExerciseId(itemId)
        router.replace({
            pathname: '/(workouts)/current-workout-exercise'
        })
    }

    const cancelWorkout = () => {
        resetSession()
        router.replace('/(tabs)/workouts')
    }

    const handleCancel = () => {
        if (!hasSessionData()) {
            cancelWorkout()
            return
        }

        Alert.alert(
            'Discard workout?',
            'Entered sets will be lost.',
            [
                { text: 'Keep Going', style: 'cancel' },
                { text: 'Discard', style: 'destructive', onPress: cancelWorkout }
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
                    <FlatList
                        data={exercises}
                        style={styles.list}
                        contentContainerStyle={styles.container}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }: { item: ExerciseWorkoutDetails }) => (
                            <List.Item
                                style={styles.itemWrapper}
                                containerStyle={styles.itemContents}
                                title={item.title}
                                onPress={() => onExercisePress(item.id)}
                                description={description(item)}
                                left={props => <Image {...props} source={getImageSource(item.photo)}
                                                      style={styles.image}/>}
                                right={props => <List.Icon {...props} icon={getStatusIcon(item.id)}/>}
                            />
                        )}
                    />
                    <Text style={styles.hint}>Required exercises should be completed or skipped before finishing. Optional exercises can be left untouched.</Text>
                    <Button
                        mode="contained"
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
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    screenContainer: {
        paddingVertical: 0,
        paddingHorizontal: 25,
        flex: 1
    },
    list: {
        flex: 1,
        width: '100%'
    },
    container: {
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        paddingTop: 2
    },
    itemContents: {
        alignItems: 'center'
    },
    itemWrapper: {
        width: '98%',
        alignSelf: 'center',
        marginBottom: 12,
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.16)',
        paddingHorizontal: 4,
        paddingVertical: 0
    },
    image: {
        width: 64,
        height: 64,
        marginRight: 8
    },
    hint: {
        marginBottom: 10,
        color: '#4b5563'
    }
})
