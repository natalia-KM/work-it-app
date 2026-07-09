import { useEffect, useMemo, useRef, useState } from 'react'
import { ExerciseList } from '@/components/ExerciseList'
import { Button, Checkbox, Text } from 'react-native-paper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAddExercisesToWorkout } from '@/hooks/workouts/useAddExercisesToWorkout'
import { StyleSheet, View } from 'react-native'
import { useGetWorkoutExercises } from '@/hooks/workouts/useGetWorkoutExercises'
import { useDeleteWorkoutExercises } from '@/hooks/workouts/useDeleteWorkoutExercises'
import { AppScreen, ScreenHeader } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'

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
        <AppScreen contentStyle={styles.container}>
            <ScreenHeader
                eyebrow="Workout builder"
                title="Select exercises"
                description={`${selectedExercises.length} selected for this workout.`}
            />
            <View style={styles.listContainer}>
                <ExerciseList
                    onExercisePress={handleExercisePress}
                    rightIcon={({ exerciseId }) =>
                        <Checkbox
                            status={selectedExercises.includes(exerciseId) ? 'checked' : 'unchecked'}
                        />
                    }
                />
            </View>
            <Button
                style={styles.submitButton}
                contentStyle={styles.submitContent}
                onPress={onConfirm}
                mode={'contained'}
                icon="check"
                disabled={!exercises || (exercises.length === 0 && selectedExercises.length === 0)}
            >
                {buttonText}
            </Button>
        </AppScreen>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 14
    },
    listContainer: {
        flex: 1,
        backgroundColor: palette.background
    },
    submitButton: {
        marginBottom: 0
    },
    submitContent: {
        minHeight: 50
    }
});
