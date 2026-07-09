import { useGetRecentExerciseLogs } from '@/hooks/logs/useGetRecentExerciseLogs'
import { Appbar, Button, Text } from 'react-native-paper'
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
                        <Text>{selectedExercise.notes}</Text>
                    </View>

                    <View style={styles.exerciseDetailsContainer}>
                        <ExerciseSetsTable/>
                    </View>

                    <Button mode={'outlined'} onPress={handleComplete}>
                        Complete Exercise
                    </Button>
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
    }
})
