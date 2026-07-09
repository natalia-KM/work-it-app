import { Appbar } from 'react-native-paper'
import { Text, View } from '@/components/Themed'
import { WorkoutExercises } from '@/components/WorkoutExercises/WorkoutExercises'
import { StyleSheet } from 'react-native'
import { useGetWorkout } from '@/hooks/workouts/useGetWorkout'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { WorkoutDetailsMenu } from '@/components/WorkoutDetails/WorkoutDetailsMenu'

interface WorkoutDetailsProps {
    workoutId: number
}

export const WorkoutDetails = ({ workoutId }: WorkoutDetailsProps) => {
    const { data: workout, isError } = useGetWorkout({ workoutId: Number(workoutId) })

    const navigation = useNavigation();

    if (isError || !workout) {
        return <Text>Could not load workout: {workoutId}</Text>
    }

    return (
        <>
            <Appbar.Header style={styles.header}>
                <Appbar.Action icon={'menu'} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}/>
                <Appbar.Content title={workout.title}/>

                <WorkoutDetailsMenu workoutId={workoutId}/>
            </Appbar.Header>
            <View style={styles.container}>
                {workout.lastWorkout && (
                    <Text>Last workout: {workout.lastWorkout.toString()}</Text>
                )}
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
    },
    header: {
        overflow: 'hidden'
    }
});
