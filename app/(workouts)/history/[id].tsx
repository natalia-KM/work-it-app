import { ScrollView, StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Appbar, Card, Divider, Text } from 'react-native-paper'
import { AppScreen, LoadingState, StateView } from '@/components/ui/Screen'
import { useGetCompletedWorkoutSession } from '@/hooks/logs/useGetCompletedWorkoutSession'
import { CompletedWorkoutExercise } from '@/database/entities'
import { palette } from '@/constants/theme'

const formatSessionDate = (date?: Date | null) => {
    if (!date) return 'Date unavailable'

    return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) return '0m'

    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return `${minutes}m`

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

const formatNumber = (value: number) => Math.round(value).toLocaleString()

const ExerciseCard = ({ exercise }: { exercise: CompletedWorkoutExercise }) => (
    <Card mode="contained" style={styles.exerciseCard}>
        <Card.Content style={styles.exerciseContent}>
            <View style={styles.exerciseHeader}>
                <View style={styles.exerciseTitleGroup}>
                    <Text variant="titleMedium" style={styles.exerciseTitle}>{exercise.exerciseTitle}</Text>
                    {exercise.notes ? (
                        <Text variant="bodySmall" style={styles.exerciseNotes}>{exercise.notes}</Text>
                    ) : null}
                </View>
                <View style={styles.exerciseMetric}>
                    <Text variant="labelLarge" style={styles.exerciseMetricValue}>{formatNumber(exercise.totalVolume)}</Text>
                    <Text variant="labelSmall" style={styles.exerciseMetricLabel}>volume</Text>
                </View>
            </View>

            <View style={styles.setHeader}>
                <Text variant="labelMedium" style={styles.setHeaderText}>Set</Text>
                <Text variant="labelMedium" style={styles.setHeaderText}>Weight</Text>
                <Text variant="labelMedium" style={styles.setHeaderText}>Reps</Text>
                <Text variant="labelMedium" style={styles.setHeaderText}>Volume</Text>
            </View>
            <Divider/>
            {exercise.details.length > 0 ? exercise.details.map((set) => (
                <View key={`${exercise.exerciseLogId}-${set.set}`} style={styles.setRow}>
                    <Text variant="bodyMedium" style={styles.setText}>{set.set}</Text>
                    <Text variant="bodyMedium" style={styles.setText}>{set.weight}kg</Text>
                    <Text variant="bodyMedium" style={styles.setText}>{set.reps}</Text>
                    <Text variant="bodyMedium" style={styles.setText}>{formatNumber(set.volume)}</Text>
                </View>
            )) : (
                <Text variant="bodyMedium" style={styles.emptySets}>No set details saved.</Text>
            )}

            <View style={styles.exerciseFooter}>
                <Text variant="labelSmall" style={styles.footerText}>Rest: {exercise.restTime}s</Text>
                <Text variant="labelSmall" style={styles.footerText}>Best: {exercise.bestAchieved ?? 'Not recorded'}</Text>
            </View>
        </Card.Content>
    </Card>
)

export default function CompletedWorkoutSessionScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const workoutLogId = Number(id)
    const { data: session, isLoading, isError } = useGetCompletedWorkoutSession(workoutLogId)
    const router = useRouter()

    if (!Number.isFinite(workoutLogId)) {
        return (
            <StateView
                title="History item unavailable"
                description="This workout session could not be identified."
                icon="alert-circle-outline"
            />
        )
    }

    if (isLoading) {
        return <LoadingState title="Loading workout session"/>
    }

    if (isError || !session) {
        return (
            <StateView
                title="Could not load workout session"
                description="This completed workout could not be read from local storage."
                icon="alert-circle-outline"
            />
        )
    }

    return (
        <>
            <Appbar.Header style={styles.appbar}>
                <Appbar.BackAction onPress={() => router.canGoBack() ? router.back() : router.replace('/(workouts)/history')}/>
                <Appbar.Content title={session.workoutTitle}/>
            </Appbar.Header>
            <AppScreen contentStyle={styles.screenContent}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Card mode="contained" style={styles.summaryCard}>
                        <Card.Content style={styles.summaryContent}>
                            <Text variant="labelLarge" style={styles.summaryLabel}>Completed workout</Text>
                            <Text variant="headlineSmall" style={styles.summaryTitle}>{session.workoutTitle}</Text>
                            <Text variant="bodyMedium" style={styles.summaryText}>{formatSessionDate(session.date)}</Text>
                            <View style={styles.summaryMetrics}>
                                <View style={styles.summaryMetric}>
                                    <Text variant="titleMedium" style={styles.summaryMetricValue}>{formatDuration(session.duration)}</Text>
                                    <Text variant="labelSmall" style={styles.summaryMetricLabel}>duration</Text>
                                </View>
                                <View style={styles.summaryMetric}>
                                    <Text variant="titleMedium" style={styles.summaryMetricValue}>{session.setCount}</Text>
                                    <Text variant="labelSmall" style={styles.summaryMetricLabel}>sets</Text>
                                </View>
                                <View style={styles.summaryMetric}>
                                    <Text variant="titleMedium" style={styles.summaryMetricValue}>{formatNumber(session.totalVolume)}</Text>
                                    <Text variant="labelSmall" style={styles.summaryMetricLabel}>volume</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Exercises</Text>
                        {session.exercises.length > 0 ? session.exercises.map((exercise) => (
                            <ExerciseCard key={exercise.exerciseLogId} exercise={exercise}/>
                        )) : (
                            <Card mode="contained" style={styles.exerciseCard}>
                                <Card.Content>
                                    <Text variant="bodyMedium" style={styles.emptySets}>
                                        This session was saved without exercise details.
                                    </Text>
                                </Card.Content>
                            </Card>
                        )}
                    </View>
                </ScrollView>
            </AppScreen>
        </>
    )
}

const styles = StyleSheet.create({
    appbar: {
        backgroundColor: palette.surface
    },
    screenContent: {
        paddingHorizontal: 0,
        paddingVertical: 0
    },
    container: {
        gap: 18,
        padding: 20,
        paddingBottom: 28
    },
    summaryCard: {
        backgroundColor: palette.primary
    },
    summaryContent: {
        gap: 12
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
    },
    summaryMetrics: {
        flexDirection: 'row',
        gap: 10
    },
    summaryMetric: {
        flex: 1,
        minHeight: 64,
        justifyContent: 'center',
        gap: 2,
        padding: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.12)'
    },
    summaryMetricValue: {
        color: '#FFFFFF',
        fontWeight: '800'
    },
    summaryMetricLabel: {
        color: '#D7F4EF'
    },
    section: {
        gap: 12
    },
    sectionTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    exerciseCard: {
        backgroundColor: palette.surface
    },
    exerciseContent: {
        gap: 12
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12
    },
    exerciseTitleGroup: {
        flex: 1,
        gap: 4
    },
    exerciseTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    exerciseNotes: {
        color: palette.muted,
        lineHeight: 18
    },
    exerciseMetric: {
        minWidth: 76,
        alignItems: 'flex-end'
    },
    exerciseMetricValue: {
        color: palette.primaryDark,
        fontWeight: '800'
    },
    exerciseMetricLabel: {
        color: palette.muted
    },
    setHeader: {
        flexDirection: 'row',
        gap: 8
    },
    setHeaderText: {
        flex: 1,
        color: palette.muted,
        fontWeight: '800'
    },
    setRow: {
        flexDirection: 'row',
        gap: 8
    },
    setText: {
        flex: 1,
        color: palette.ink
    },
    emptySets: {
        color: palette.muted,
        lineHeight: 20
    },
    exerciseFooter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingTop: 2
    },
    footerText: {
        color: palette.muted,
        fontWeight: '700'
    }
})
