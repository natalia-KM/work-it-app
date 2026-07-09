import { useEffect, useMemo, useRef, useState } from 'react'
import { ExerciseList } from '@/components/ExerciseList'
import { Button, Checkbox, Text } from 'react-native-paper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAddExercisesToWorkout } from '@/hooks/workouts/useAddExercisesToWorkout'
import { View } from '@/components/Themed'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGetWorkoutExercises } from '@/hooks/workouts/useGetWorkoutExercises'
import { useDeleteWorkoutExercises } from '@/hooks/workouts/useDeleteWorkoutExercises'

const suffix = (count: number) => {
    if (count > 1) return 's'
    return ''
}

export default function SelectWorkoutExercises() {
    const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
    const hasInitializedSelection = useRef(false)

    const { data: exercises } = useGetWorkoutExercises({ workoutId: Number(workoutId) })

    const exerciseIds = useMemo(() => {
        return exercises?.map(exercise => exercise.id)
    }, [exercises])

    const [selectedExercises, setSelectedExercises] = useState<number[]>([])

    useEffect(() => {
        if (!exerciseIds || hasInitializedSelection.current) return

        setSelectedExercises(exerciseIds)
        hasInitializedSelection.current = true
    }, [exerciseIds])

    const { mutateAsync: addExercises } = useAddExercisesToWorkout()
    const { mutateAsync: deleteExercises } = useDeleteWorkoutExercises()

    const router = useRouter();

    const buttonText = useMemo(() => {
        if (!exercises || exercises.length === 0) {
            if (!selectedExercises || selectedExercises.length === 0) return 'Select exercises'

            return `Add ${selectedExercises.length} Exercise${suffix(selectedExercises.length)}`
        }

        if (exercises.length > selectedExercises.length) {
            const len = exercises.length - selectedExercises.length
            return `Remove ${len} Exercise${suffix(len)}`
        } else if (exercises.length < selectedExercises.length) {
            const len = selectedExercises.length - exercises.length
            return `Add ${len} Exercise${suffix(len)}`
        }
        return 'Done'
    }, [selectedExercises, exercises])

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
        const toAdd = selectedExercises.filter((id) => !exerciseIds?.includes(id));
        const toRemove = exerciseIds?.filter((id) => !selectedExercises.includes(id));

        try {
            if (toAdd && toAdd.length > 0) {
                await addExercises({ workoutId: Number(workoutId), exercises: toAdd })
            }
            if (toRemove && toRemove.length > 0) {
                await deleteExercises({ workoutId: Number(workoutId), exercises: toRemove })
            }
        } catch (err) {
            alert('Error adding exercises to workout')
            console.error(err)
        } finally {
            router.navigate({
                pathname: '/(tabs)/workouts',
                params: { targetWorkoutId: workoutId.toString() }
            });
        }
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
                    disabled={!exercises || (exercises.length === 0 && selectedExercises.length === 0)}
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
