import { FlatList, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Appbar, Card, Icon, List, Text } from 'react-native-paper'
import { AppScreen, LoadingState, ScreenHeader, StateView } from '@/components/ui/Screen'
import { useGetCompletedWorkoutHistory } from '@/hooks/logs/useGetCompletedWorkoutHistory'
import { CompletedWorkoutHistoryItem } from '@/database/entities'
import { palette } from '@/constants/theme'

const formatSessionDate = (date?: Date | null) => {
    if (!date) return 'Date unavailable'

    return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
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

const formatVolume = (volume: number) => {
    const rounded = Math.round(volume)

    return rounded.toLocaleString()
}

const SessionCard = ({ session }: { session: CompletedWorkoutHistoryItem }) => {
    const router = useRouter()

    return (
        <Card
            mode="contained"
            style={styles.sessionCard}
            onPress={() => router.navigate({
                pathname: '/(workouts)/history/[id]',
                params: { id: session.workoutLogId.toString() }
            })}
        >
            <List.Item
                title={session.workoutTitle}
                description={`${formatSessionDate(session.date)} | ${formatDuration(session.duration)}`}
                titleStyle={styles.sessionTitle}
                descriptionStyle={styles.sessionDescription}
                left={(props) => <List.Icon {...props} icon="calendar-check-outline" color={palette.primary}/>}
                right={(props) => <List.Icon {...props} icon="chevron-right"/>}
            />
            <View style={styles.metricRow}>
                <View style={styles.metric}>
                    <Text variant="titleMedium" style={styles.metricValue}>{session.exerciseCount}</Text>
                    <Text variant="labelSmall" style={styles.metricLabel}>exercises</Text>
                </View>
                <View style={styles.metric}>
                    <Text variant="titleMedium" style={styles.metricValue}>{session.setCount}</Text>
                    <Text variant="labelSmall" style={styles.metricLabel}>sets</Text>
                </View>
                <View style={styles.metric}>
                    <Text variant="titleMedium" style={styles.metricValue}>{formatVolume(session.totalVolume)}</Text>
                    <Text variant="labelSmall" style={styles.metricLabel}>volume</Text>
                </View>
            </View>
        </Card>
    )
}

export default function CompletedWorkoutHistoryScreen() {
    const { data: sessions = [], isLoading, isError } = useGetCompletedWorkoutHistory()
    const router = useRouter()

    if (isLoading) {
        return <LoadingState title="Loading workout history"/>
    }

    if (isError) {
        return (
            <StateView
                title="Could not load history"
                description="Completed workouts could not be read from local storage."
                icon="alert-circle-outline"
            />
        )
    }

    return (
        <>
            <Appbar.Header style={styles.appbar}>
                <Appbar.BackAction onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}/>
                <Appbar.Content title="Workout history"/>
            </Appbar.Header>
            <AppScreen contentStyle={styles.screenContent}>
                <FlatList
                    data={sessions}
                    keyExtractor={(item) => item.workoutLogId.toString()}
                    ListHeaderComponent={(
                        <ScreenHeader
                            eyebrow="Completed sessions"
                            title="History"
                            description="Review saved workouts and the sets you logged."
                        />
                    )}
                    ListEmptyComponent={(
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Icon source="history" size={34} color={palette.primary}/>
                            </View>
                            <Text variant="titleMedium" style={styles.emptyTitle}>No completed workouts yet</Text>
                            <Text variant="bodyMedium" style={styles.emptyText}>
                                Finished workouts will appear here with their exercises, sets, and volume.
                            </Text>
                        </View>
                    )}
                    renderItem={({ item }) => <SessionCard session={item}/>}
                    contentContainerStyle={styles.listContent}
                />
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
    listContent: {
        flexGrow: 1,
        gap: 14,
        padding: 20
    },
    sessionCard: {
        overflow: 'hidden',
        backgroundColor: palette.surface
    },
    sessionTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    sessionDescription: {
        color: palette.muted
    },
    metricRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        paddingBottom: 16
    },
    metric: {
        flex: 1,
        minHeight: 58,
        justifyContent: 'center',
        gap: 2,
        padding: 10,
        borderRadius: 8,
        backgroundColor: palette.surfaceAlt
    },
    metricValue: {
        color: palette.ink,
        fontWeight: '800'
    },
    metricLabel: {
        color: palette.muted
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 52,
        gap: 10
    },
    emptyIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.surfaceAlt
    },
    emptyTitle: {
        color: palette.ink,
        fontWeight: '700',
        textAlign: 'center'
    },
    emptyText: {
        maxWidth: 320,
        color: palette.muted,
        lineHeight: 20,
        textAlign: 'center'
    }
})
