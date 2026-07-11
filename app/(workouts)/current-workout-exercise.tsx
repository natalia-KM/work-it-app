import { useGetRecentExerciseLogs } from '@/hooks/logs/useGetRecentExerciseLogs'
import { Appbar, Button, Card, Chip, IconButton, Text, TextInput } from 'react-native-paper'
import { StyleSheet, View } from 'react-native'
import { useGetWorkoutExercises } from '@/hooks/workouts/useGetWorkoutExercises'
import { DEFAULT_REST_TIMER_SECONDS, useWorkoutProgressStore } from '@/store'
import { ExerciseSetsTable } from '@/components/ExerciseSetsTable/ExerciseSetsTable'
import { ExerciseLog } from '@/database/entities'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LoadingState, StateView } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'
import { useEffect, useState } from 'react'
import { ExerciseHistoryModal } from '@/components/WorkoutExerciseHistory/ExerciseHistoryModal'
import { usePersistActiveWorkoutDraft } from '@/hooks/workouts/usePersistActiveWorkoutDraft'

const formatRestTimer = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.round(seconds))
    const minutes = Math.floor(safeSeconds / 60)
    const remainingSeconds = safeSeconds % 60

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// TODO: maybe context for current and store for whole?
export default function CurrentWorkoutExerciseScreen() {
    usePersistActiveWorkoutDraft()
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
        addSet,
        restTimerRemainingSeconds,
        isRestTimerRunning,
        hasRestTimerStarted,
        pauseRestTimer,
        resumeRestTimer,
        resetRestTimer,
        adjustRestTimer,
        tickRestTimer
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

    useEffect(() => {
        if (!isRestTimerRunning || restTimerRemainingSeconds <= 0) return

        const intervalId = setInterval(() => {
            tickRestTimer()
        }, 1000)

        return () => clearInterval(intervalId)
    }, [isRestTimerRunning, restTimerRemainingSeconds, tickRestTimer])

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
    const restTimerDisplaySeconds = hasRestTimerStarted
        ? restTimerRemainingSeconds
        : exerciseProgress?.restTime ?? DEFAULT_REST_TIMER_SECONDS

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

                    <Card mode="contained" style={styles.restTimerCard}>
                        <Card.Content style={styles.restTimerContent}>
                            <View style={styles.restTimerHeader}>
                                <View style={styles.restTimerTitleGroup}>
                                    <Text variant="labelLarge" style={styles.restTimerLabel}>Rest</Text>
                                    <Text variant="headlineSmall" style={styles.restTimerValue}>
                                        {formatRestTimer(restTimerDisplaySeconds)}
                                    </Text>
                                </View>
                                <View style={styles.restTimerIconActions}>
                                    <IconButton
                                        mode="contained-tonal"
                                        icon={isRestTimerRunning ? 'pause' : 'play'}
                                        onPress={isRestTimerRunning ? pauseRestTimer : resumeRestTimer}
                                    />
                                    <IconButton
                                        mode="contained-tonal"
                                        icon="restart"
                                        onPress={resetRestTimer}
                                    />
                                </View>
                            </View>
                            <View style={styles.restTimerAdjustments}>
                                <Button mode="outlined" compact icon="minus" onPress={() => adjustRestTimer(-30)}>
                                    30s
                                </Button>
                                <Button mode="outlined" compact icon="plus" onPress={() => adjustRestTimer(30)}>
                                    30s
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>

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
    restTimerCard: {
        backgroundColor: palette.surface
    },
    restTimerContent: {
        gap: 10
    },
    restTimerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
    },
    restTimerTitleGroup: {
        flex: 1,
        gap: 2
    },
    restTimerLabel: {
        color: palette.primaryDark,
        fontWeight: '800',
        textTransform: 'uppercase'
    },
    restTimerValue: {
        color: palette.ink,
        fontWeight: '800'
    },
    restTimerIconActions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    restTimerAdjustments: {
        flexDirection: 'row',
        gap: 10
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
        alignItems: 'center'
    }
})
