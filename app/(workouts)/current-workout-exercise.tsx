import { useGetRecentExerciseLogs } from '@/hooks/logs/useGetRecentExerciseLogs'
import { Appbar, Button, Text, TextInput } from 'react-native-paper'
import { View } from '@/components/Themed'
import { useGetWorkoutExercises } from '@/hooks/workouts/useGetWorkoutExercises'
import { useWorkoutProgressStore } from '@/store'
import { ExerciseSetsTable } from '@/components/ExerciseSetsTable/ExerciseSetsTable'
import { ExerciseLog } from '@/database/entities'
import { useRouter } from 'expo-router'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// TODO: maybe context for current and store for whole?
export default function CurrentWorkoutExerciseScreen() {
    const {
        workoutId,
        currentExerciseId: exerciseId,
        workoutTitle,
        getExerciseDetails,
        setCurrentExerciseDetails,
        confirmCurrentExercise,
        completeCurrentExercise,
        skipCurrentExercise,
        setCurrentExerciseNotes,
        exerciseData,
        addSet
    } = useWorkoutProgressStore()

    // TODO: hook for specific exercise
    const {
        data: exercise,
        isLoading: isExerciseLoading,
        isError: isExerciseError,
        error: exerciseError
    } = useGetWorkoutExercises({ workoutId })

    const {
        data: recentExerciseLogs,
        isLoading: isLogLoading,
        isError: isLogError,
        error: logError
    } = useGetRecentExerciseLogs({
        workoutId,
        exerciseId,
        refetchOnMount: 'always',
        onSuccess: (log: ExerciseLog[]) => {
            const details = getExerciseDetails(exerciseId)

            if (details.length > 0) {
                setCurrentExerciseDetails(details)
                return
            }
            setCurrentExerciseDetails(log[0]?.details ?? [])

            const isLogEmpty = !log[0] || log[0]?.details?.length === 0

            if (isLogEmpty) {
                addSet()
            }
        }
    })

    const router = useRouter()

    if (isLogLoading || isExerciseLoading) {
        return <Text>Loading</Text>
    }

    if (isLogError || isExerciseError) {
        return <Text>Error ex: {exerciseError?.message}, error log: {logError?.message}</Text>
    }

    if (!exercise || !recentExerciseLogs) {
        return <Text>Error 2</Text>
    }

    const selectedExercise = exercise.find(item => item.id === exerciseId)
    const exerciseProgress = exerciseData.find(item => item.exerciseId === exerciseId)

    if (!selectedExercise) {
        return <Text>Exercise unavailable</Text>
    }

    const handleBack = () => {
        confirmCurrentExercise()

        router.replace({
            pathname: '/(workouts)/current-workout-main',
            params: { workoutId }
        })
    }

    const handleComplete = () => {
        completeCurrentExercise()

        router.replace({
            pathname: '/(workouts)/current-workout-main',
            params: { workoutId }
        })
    }

    const handleSkip = () => {
        skipCurrentExercise()

        router.replace({
            pathname: '/(workouts)/current-workout-main',
            params: { workoutId }
        })
    }

    const targetDescription = [
        selectedExercise.isOptional ? 'Optional' : 'Required',
        selectedExercise.targetSets || selectedExercise.targetReps
            ? `Target: ${selectedExercise.targetSets ?? '?'} x ${selectedExercise.targetReps ?? '?'}${selectedExercise.targetWeight ? ` @ ${selectedExercise.targetWeight}kg` : ''}`
            : undefined,
        selectedExercise.lastCompleted ? `Last: ${selectedExercise.lastCompleted.toLocaleDateString()}` : undefined
    ].filter(Boolean).join(' | ')

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={handleBack}/>
                <Appbar.Content title={workoutTitle}/>
            </Appbar.Header>
            <SafeAreaView style={styles.screen}>
                <View style={styles.container}>
                    <View>
                        <Text variant={'titleMedium'}>{selectedExercise.title}</Text>
                        {targetDescription && <Text>{targetDescription}</Text>}
                        {selectedExercise.instructions && (
                            <Text style={styles.instructions}>{selectedExercise.instructions}</Text>
                        )}
                        {selectedExercise.notes && <Text>{selectedExercise.notes}</Text>}
                    </View>

                    <TextInput
                        label="Session notes"
                        value={exerciseProgress?.notes ?? ''}
                        onChangeText={setCurrentExerciseNotes}
                        multiline
                        style={styles.notesInput}
                    />

                    <View style={styles.exerciseDetailsContainer}>
                        <ExerciseSetsTable/>
                    </View>

                    <View style={styles.actions}>
                        <Button mode={'outlined'} onPress={handleSkip}>
                            Skip
                        </Button>
                        <Button mode={'contained'} onPress={handleComplete}>
                            Complete Exercise
                        </Button>
                    </View>
                </View>
            </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'stretch'
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    exerciseDetailsContainer: {
        flex: 1
    },
    instructions: {
        marginTop: 8,
        color: '#374151'
    },
    notesInput: {
        marginTop: 16,
        backgroundColor: 'white'
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end'
    }
})
