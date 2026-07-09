import { Appbar, Card, Text } from 'react-native-paper'
import { WorkoutExercises } from '@/components/WorkoutExercises/WorkoutExercises'
import { StyleSheet, View } from 'react-native'
import { useGetWorkout } from '@/hooks/workouts/useGetWorkout'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { WorkoutDetailsMenu } from '@/components/WorkoutDetails/WorkoutDetailsMenu'
import { palette } from '@/constants/theme'
import { LoadingState, StateView } from '@/components/ui/Screen'

interface WorkoutDetailsProps {
    workoutId: number
}

export const WorkoutDetails = ({ workoutId }: WorkoutDetailsProps) => {
    const { data: workout, isError } = useGetWorkout({ workoutId: Number(workoutId) })

    const navigation = useNavigation();

    if (isError) {
        return (
            <StateView
                title="Could not load workout"
                description={`Workout ${workoutId} is unavailable.`}
                icon="alert-circle-outline"
            />
        )
    }

    if (!workout) {
        return <LoadingState title="Loading workout"/>
    }

    return (
        <>
            <Appbar.Header style={styles.header}>
                <Appbar.Action icon={'menu'} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}/>
                <Appbar.Content title={workout.title}/>

                <WorkoutDetailsMenu workoutId={workoutId}/>
            </Appbar.Header>
            <View style={styles.container}>
                <Card mode="contained" style={styles.summaryCard}>
                    <Card.Content style={styles.summaryContent}>
                        <Text variant="labelLarge" style={styles.summaryLabel}>Current plan</Text>
                        <Text variant="headlineSmall" style={styles.summaryTitle}>{workout.title}</Text>
                        <Text variant="bodyMedium" style={styles.summaryText}>
                            {workout.lastWorkout ? `Last completed ${workout.lastWorkout.toLocaleDateString()}` : 'Not completed yet'}
                        </Text>
                        {workout.notes ? <Text variant="bodyMedium" style={styles.summaryText}>{workout.notes}</Text> : null}
                    </Card.Content>
                </Card>
                <WorkoutExercises workoutId={Number(workoutId)}/>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.background,
        paddingHorizontal: 20,
        paddingVertical: 18,
        gap: 16
    },
    header: {
        overflow: 'hidden',
        backgroundColor: palette.surface
    },
    summaryCard: {
        backgroundColor: palette.primary
    },
    summaryContent: {
        gap: 5
    },
    summaryLabel: {
        color: '#D7F4EF',
        textTransform: 'uppercase'
    },
    summaryTitle: {
        color: '#FFFFFF',
        fontWeight: '800'
    },
    summaryText: {
        color: '#E8FFFB'
    }
});
