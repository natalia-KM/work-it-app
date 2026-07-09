import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router'
import { Appbar, Button, List } from 'react-native-paper'
import { useGetWorkout } from '@/hooks/workouts/useGetWorkout'
import { useGetWorkoutExercises } from '@/hooks/workouts/useGetWorkoutExercises'
import { FlatList, Image, StyleSheet } from 'react-native'
import { ExerciseWorkoutDetails } from '@/database/entities'
import { getImageSource } from '@/components/utils/getImageSource'
import { ExerciseProgressLog, useWorkoutProgressStore } from '@/store'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function CurrentWorkoutMainScreen() {
    const {
        workoutId,
        setWorkoutDetails,
        setCurrentExerciseId,
        exerciseData,
        setExerciseData
    } = useWorkoutProgressStore()

    const { data: workout, isError } = useGetWorkout({
        workoutId,
        refetchOnMount: 'always',
        onSuccess: (workout) => {
            console.log('setWorkoutDetails: ', workout)
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
                        bestAchieved: item.bestAchieved ?? undefined
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
            pathname: '/current-workout-exercise'
        })
    }

    const description = (lastCompleted?: Date | null) => {
        if (!lastCompleted) {
            return
        }
        return `Last: ${lastCompleted.toDateString()}`
    }

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => {
                }}/>
                <Appbar.Content title={workout.title}/>
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
                                description={description(item.lastCompleted)}
                                left={props => <Image {...props} source={getImageSource(item.photo)}
                                                      style={styles.image}/>}
                            />
                        )}
                    />
                    <Button onPress={() => {
                        console.log('Current Data: ')
                        console.log(exerciseData)
                    }}>
                        Temp check btn
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
    }
})