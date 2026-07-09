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
        exerciseData,
        workoutId,
        currentExerciseId: exerciseId,
        workoutTitle,
        getExerciseDetails,
        setCurrentExerciseDetails,
        confirmCurrentExercise,
        addSet
    } = useWorkoutProgressStore()

    // TODO: hook for specific exercise
    const {
        data: exercise,
        isLoading: isExerciseLoading,
        isError: isExerciseError,
        error: error1
    } = useGetWorkoutExercises({ workoutId })

    const {
        data: recentExerciseLogs,
        isLoading: isLogLoading,
        isError: isLogError,
        error: error2
    } = useGetRecentExerciseLogs({
        workoutId,
        exerciseId,
        refetchOnMount: 'always',
        onSuccess: (log: ExerciseLog[]) => {
            console.log('ex data: ', exerciseData)
            console.log('current exercise id: ', exerciseId)
            const details = getExerciseDetails(exerciseId)
            console.log('details:', details)

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
        return <Text>Error ex: {error1?.message}, error log: {error2?.message}</Text>
    }

    if (!exercise || !recentExerciseLogs) {
        return <Text>Error 2</Text>
    }

    const handleComplete = () => {
        confirmCurrentExercise()

        router.replace({
            pathname: '/current-workout-main',
            params: { workoutId }
        })
    }

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={handleComplete}/>
                <Appbar.Content title={workoutTitle}/>
            </Appbar.Header>
            <SafeAreaView style={styles.screen}>
                <View style={styles.container}>
                    <View>
                        <Text variant={'titleMedium'}>{exercise[0].title}</Text>
                        <Text>{exercise[0].notes}</Text>
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