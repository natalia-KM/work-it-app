import { Stack } from "expo-router";

export default function ExercisesLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="add-exercise"
                options={{ presentation: 'formSheet', headerShown: false }}
            />
            <Stack.Screen
                name="[id]"
                options={{ presentation: 'formSheet', headerShown: false }}
            />
        </Stack>
    );
}
