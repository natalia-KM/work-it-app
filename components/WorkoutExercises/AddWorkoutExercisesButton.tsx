import { useRouter } from 'expo-router'
import { Button } from 'react-native-paper'
import { ViewStyle } from 'react-native'

interface AddWorkoutExercisesButtonProps {
    workoutId: number
    styles?: ViewStyle
}

export const AddWorkoutExercisesButton = ({ workoutId, styles }: AddWorkoutExercisesButtonProps) => {
    const router = useRouter()

    const handleAddExercises = () => {
        router.navigate({
            pathname: "/(workouts)/select-exercises",
            params: { workoutId }
        });
    };

    return (
        <Button
            onPress={handleAddExercises}
            mode="contained"
            style={styles}
        >
            Add Exercises
        </Button>
    )
}