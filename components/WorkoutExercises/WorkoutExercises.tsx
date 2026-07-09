import { useGetWorkoutExercises } from '@/hooks/workouts/useGetWorkoutExercises'
import { Button, Card, List, Text } from 'react-native-paper'
import { Image, ScrollView, StyleSheet, View } from 'react-native'
import { NoItemsFound } from '@/components/NoItemsFound'
import { getImageSource } from '@/components/utils/getImageSource'
import { AddWorkoutExercisesButton } from '@/components/WorkoutExercises/AddWorkoutExercisesButton'
import { useRouter } from 'expo-router'
import { useWorkoutProgressStore } from '@/store/useWorkoutProgressStore'
import { palette } from '@/constants/theme'
import { StateView } from '@/components/ui/Screen'

interface WorkoutExercisesProps {
    workoutId: number
}

const formatDate = (date?: Date | null) => {
    if (!date) return 'Not completed'

    return date.toLocaleDateString()
}

export const WorkoutExercises = ({ workoutId }: WorkoutExercisesProps) => {
    const { data: exercises, isError: isExerciseError } = useGetWorkoutExercises({ workoutId })

    const { resetSession, setWorkoutDetails } = useWorkoutProgressStore()
    const router = useRouter()

    if (isExerciseError || !exercises) {
        return (
            <StateView
                title="Could not load exercises"
                description="This workout could not be read from local storage."
                icon="alert-circle-outline"
            />
        )
    }

    if (exercises.length === 0) {
        return (
            <NoItemsFound
                title={'This workout is empty'}
                description={'Start building your workout by adding exercises'}
                ActionButton={<AddWorkoutExercisesButton workoutId={workoutId}/>}
            />
        )
    }

    return (
        <View style={styles.area}>
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {exercises.map(exercise => (
                    <Card key={exercise.id} mode="contained" style={styles.card}>
                        <List.Accordion
                            title={exercise.title}
                            id={exercise.id.toString()}
                            style={styles.itemWrapper}
                            titleStyle={styles.itemTitle}
                            description={[
                                exercise.isOptional ? 'Optional' : 'Required',
                                exercise.targetSets || exercise.targetReps
                                    ? `${exercise.targetSets ?? '?'} x ${exercise.targetReps ?? '?'}${exercise.targetWeight ? ` @ ${exercise.targetWeight}kg` : ''}`
                                    : undefined
                            ].filter(Boolean).join(' | ')}
                            descriptionStyle={styles.itemDescription}
                            left={props => <Image {...props} source={getImageSource(exercise.photo)} style={styles.image}/>}
                        >
                            <View style={styles.exerciseSummary}>
                                <Text variant="bodyMedium" style={styles.summaryLine}>Last completed: {formatDate(exercise.lastCompleted)}</Text>
                                <Text variant="bodyMedium" style={styles.summaryLine}>Best set: {exercise.bestAchieved ?? 'Not recorded'}</Text>
                                {exercise.instructions ? <Text variant="bodyMedium" style={styles.summaryLine}>Setup: {exercise.instructions}</Text> : null}
                                {exercise.notes ? <Text variant="bodyMedium" style={styles.summaryLine}>Notes: {exercise.notes}</Text> : null}
                            </View>
                        </List.Accordion>
                    </Card>
                ))}
            </ScrollView>
            <Button mode="contained" icon="play" contentStyle={styles.startButtonContent} onPress={() => {
                resetSession()
                setWorkoutDetails(workoutId)
                router.navigate({
                    pathname: '/(workouts)/current-workout-main'
                })
            }}>
                Start workout
            </Button>
        </View>
    )
}

const styles = StyleSheet.create({
    area: {
        flex: 1,
        width: '100%',
        gap: 16
    },
    list: {
        flex: 1,
        width: '100%'
    },
    listContent: {
        gap: 12,
        paddingBottom: 12
    },
    itemWrapper: {
        backgroundColor: palette.surface,
        borderRadius: 8
    },
    card: {
        backgroundColor: palette.surface
    },
    itemTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    image: {
        width: 54,
        height: 54,
        marginRight: 6,
        marginLeft: 4,
        borderRadius: 8,
        backgroundColor: palette.surfaceAlt
    },
    itemDescription: {
        color: palette.muted
    },
    exerciseSummary: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 6
    },
    summaryLine: {
        color: palette.muted,
        lineHeight: 20
    },
    addButton: {
        marginBottom: 10
    },
    startButtonContent: {
        minHeight: 48
    }
})
