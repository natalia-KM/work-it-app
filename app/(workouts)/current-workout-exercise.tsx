import { useGetRecentExerciseLogs } from '@/hooks/logs/useGetRecentExerciseLogs'
import { Appbar, Button, Card, Chip, Text, TextInput } from 'react-native-paper'
import { StyleSheet, View } from 'react-native'
import { useGetWorkoutExercises } from '@/hooks/workouts/useGetWorkoutExercises'
import { useWorkoutProgressStore } from '@/store'
import { ExerciseSetsTable } from '@/components/ExerciseSetsTable/ExerciseSetsTable'
import { ExerciseLog } from '@/database/entities'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LoadingState, StateView } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'
import { useState } from 'react'
import { ExerciseHistoryModal } from '@/components/WorkoutExerciseHistory/ExerciseHistoryModal'

// TODO: maybe context for current and store for whole?
export default function CurrentWorkoutExerciseScreen() {
    const [isHistoryVisible, setIsHistoryVisible] = useState(false)
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
        return <LoadingState title="Loading exercise"/>
    }

    if (isLogError || isExerciseError) {
        return (
            <StateView
                title="Could not load exercise"
                description={exerciseError?.message ?? logError?.message ?? 'The selected exercise is unavailable.'}
                icon="alert-circle-outline"
            />
        )
    }

    if (!exercise || !recentExerciseLogs) {
        return <StateView title="Exercise unavailable" icon="alert-circle-outline"/>
    }

    const selectedExercise = exercise.find(item => item.id === exerciseId)
    const exerciseProgress = exerciseData.find(item => item.exerciseId === exerciseId)

    if (!selectedExercise) {
        return <StateView title="Exercise unavailable" icon="alert-circle-outline"/>
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
                <Appbar.Action icon="history" onPress={() => setIsHistoryVisible(true)}/>
            </Appbar.Header>
            <SafeAreaView style={styles.screen}>
                <View style={styles.container}>
                    <Card mode="contained" style={styles.exerciseCard}>
                        <Card.Content style={styles.exerciseCardContent}>
                        <Text variant={'headlineSmall'} style={styles.exerciseTitle}>{selectedExercise.title}</Text>
                        {targetDescription && (
                            <View style={styles.metaRow}>
                                {targetDescription.split(' | ').map((item) => (
                                    <Chip key={item} compact style={styles.metaChip}>{item}</Chip>
                                ))}
                            </View>
                        )}
                        {selectedExercise.instructions && (
                            <Text style={styles.instructions}>{selectedExercise.instructions}</Text>
                        )}
                        {selectedExercise.notes && <Text>{selectedExercise.notes}</Text>}
                        </Card.Content>
                    </Card>

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
                        <Button mode={'contained'} icon="check" onPress={handleComplete}>
                            Complete
                        </Button>
                    </View>
                </View>
            </SafeAreaView>
            <ExerciseHistoryModal
                visible={isHistoryVisible}
                onDismiss={() => setIsHistoryVisible(false)}
                exerciseId={exerciseId}
                workoutId={workoutId}
                exerciseTitle={selectedExercise.title}
            />
        </>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: palette.background,
        alignItems: 'stretch'
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 16
    },
    exerciseDetailsContainer: {
        flex: 1
    },
    exerciseCard: {
        backgroundColor: palette.surface
    },
    exerciseCardContent: {
        gap: 8
    },
    exerciseTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6
    },
    metaChip: {
        backgroundColor: palette.surfaceAlt
    },
    instructions: {
        color: palette.muted,
        lineHeight: 20
    },
    notesInput: {
        backgroundColor: palette.surface
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
        alignItems: 'center'
    }
})
