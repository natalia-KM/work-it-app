import { Stack } from "expo-router";

export default function WorkoutsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="[id]"
                options={{ presentation: 'formSheet', headerShown: false }}
            />
            <Stack.Screen
                name="select-exercises"
                options={{ presentation: 'formSheet', headerShown: true, title: 'Select Exercises' }}
            />
        </Stack>
    );
}
