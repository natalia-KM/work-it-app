import { useLocalSearchParams } from 'expo-router'
import { Text, View } from '@/components/Themed'
import { useGetWorkout } from '@/hooks/workouts/useGetWorkout'
import { Appbar } from 'react-native-paper'
import { WorkoutExercises } from '@/components/WorkoutExercises/WorkoutExercises'
import { StyleSheet } from 'react-native';

export default function WorkoutDetails() {
    const { id: workoutId } = useLocalSearchParams<{ id: string }>();

    const { data: workout, isError } = useGetWorkout(Number(workoutId))

    if (isError || !workout) {
        return <Text>Something went wrong...</Text>
    }

    return (
        <>
            <Appbar.Header>
                <Appbar.Action icon={'menu'} onPress={() => console.log('TODO')}/>
                <Appbar.Content title={workout.title}/>
            </Appbar.Header>
            <View style={styles.container}>
                <WorkoutExercises workoutId={Number(workoutId)}/>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10
    }
});
