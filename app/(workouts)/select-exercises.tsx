import { useMemo, useState } from 'react'
import { ExerciseList } from '@/components/ExerciseList'
import { Button, Checkbox, Text } from 'react-native-paper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAddExercisesToWorkout } from '@/hooks/workouts/useAddExercisesToWorkout'
import { useQueryClient } from '@tanstack/react-query'
import { View } from '@/components/Themed'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SelectWorkoutExercises() {
    const { workoutId } = useLocalSearchParams<{ workoutId: string }>();

    const [selectedExercises, setSelectedExercises] = useState<number[]>([])
    const { mutateAsync: addExercises } = useAddExercisesToWorkout()

    const queryClient = useQueryClient()
    const router = useRouter();

    const buttonText = useMemo(() => {
        if (!selectedExercises || selectedExercises.length === 0) return 'Select exercises'

        if (selectedExercises.length === 1) return 'Add 1 Exercise'

        return `Add ${selectedExercises.length} Exercises`
    }, [selectedExercises])

    if (!workoutId) {
        return <Text>Something went wrong...</Text>
    }

    const handleExercisePress = (exerciseId: number) => {
        setSelectedExercises((prev) => {
            if (prev.includes(exerciseId)) {
                return prev.filter((id) => id !== exerciseId)
            } else {
                return [...prev, exerciseId]
            }
        })
    }

    const onConfirm = async () => {
        await addExercises({ workoutId: Number(workoutId), exercises: selectedExercises })
            .then(() => {
                queryClient.invalidateQueries({ queryKey: ['workout-exercises'] })
            })
            .catch((err) => {
                alert('Error adding exercises to workout')
                console.error(err)
            })
            .finally(() => {
                router.push(`/(workouts)/${workoutId}`)
            })
    }

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.container}>
                <ExerciseList
                    onExercisePress={handleExercisePress}
                    rightIcon={({ exerciseId }) =>
                        <Checkbox
                            status={selectedExercises.includes(exerciseId) ? 'checked' : 'unchecked'}
                        />
                    }
                />
                <Button
                    style={styles.submitButton}
                    onPress={onConfirm}
                    mode={'contained'}
                    disabled={!selectedExercises || selectedExercises.length === 0}
                >
                    {buttonText}
                </Button>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white'
    },
    container: {
        flex: 1,
        paddingVertical: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitButton: {
        marginBottom: 15
    }
});
