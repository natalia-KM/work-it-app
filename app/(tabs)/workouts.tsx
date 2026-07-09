import { useGetWorkouts } from '@/hooks/workouts/useGetWorkouts'
import { useLocalSearchParams } from 'expo-router'
import { AddWorkoutButton } from '@/components/AddWorkoutButton/AddWorkoutButton'
import { NoItemsFound } from '@/components/NoItemsFound'
import { WorkoutDetails } from '@/components/WorkoutDetails'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { useMemo } from 'react'
import { WorkoutDrawer } from '@/components/WorkoutDrawer/WorkoutDrawer'
import { LoadingState, StateView } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'

const Drawer = createDrawerNavigator();

export default function WorkoutsListScreen() {
    const { data: workouts, isLoading, isError } = useGetWorkouts()
    const { targetWorkoutId } = useLocalSearchParams<{ targetWorkoutId?: string }>();

    const selectedWorkout = useMemo(() => {
        return workouts?.find((w) => w.id.toString() === targetWorkoutId) || workouts?.[0];
    }, [targetWorkoutId, workouts])

    if (isLoading) {
        return <LoadingState title="Loading workouts"/>
    }

    if (!workouts || isError) {
        return (
            <StateView
                title="Could not load workouts"
                description="Your saved workouts could not be read from local storage."
                icon="alert-circle-outline"
            />
        )
    }

    if (workouts?.length === 0) {
        return (
            <NoItemsFound
                title={'No workouts found'}
                description={'Start by creating your first workout to track your progress'}
                ActionButton={<AddWorkoutButton/>}
            />
        )
    }

    return (
        <Drawer.Navigator
            drawerContent={(props) => <WorkoutDrawer {...props} />}
            initialRouteName={selectedWorkout?.id.toString() ?? workouts[0].id.toString()}
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: palette.primary,
                drawerInactiveTintColor: palette.muted,
                drawerActiveBackgroundColor: palette.surfaceAlt,
                drawerStyle: {
                    backgroundColor: palette.background
                },
                drawerLabelStyle: {
                    fontWeight: '700'
                }
            }}
        >
            {workouts.map((workout) => (
                <Drawer.Screen
                    key={workout.id}
                    name={workout.id.toString()}
                    options={{
                        drawerLabel: workout.title
                    }}
                >
                    {() => <WorkoutDetails workoutId={workout.id}/>}
                </Drawer.Screen>
            ))}
        </Drawer.Navigator>
    )
}
