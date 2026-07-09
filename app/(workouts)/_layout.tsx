import { Stack } from "expo-router";

export default function WorkoutsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="select-exercises"
                options={{ presentation: 'formSheet', headerShown: true, title: 'Select Exercises' }}
            />
            <Stack.Screen
                name="current-workout-main"
                options={{ presentation: 'formSheet', headerShown: false, title: 'Workout' }}
            />
            <Stack.Screen
                name="current-workout-exercise"
                options={{
                    presentation: 'formSheet',
                    headerShown: false,
                    title: 'Current Exercise',
                    gestureEnabled: false
                }}
            />
        </Stack>
    );
}
