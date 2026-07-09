import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, List, Text } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useGetWorkouts } from '@/hooks/workouts/useGetWorkouts'
import { AddWorkoutButton } from '@/components/AddWorkoutButton/AddWorkoutButton'
import { Workout } from '@/database/entities'
import { useGetWorkoutStats } from '@/hooks/logs/useGetWorkoutStats'
import { AppScreen, LoadingState, MetricCard, ScreenHeader, SectionHeader, StateView } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'

const formatWorkoutDate = (date?: Date | null) => {
    if (!date) return 'Not completed yet'

    return `Last: ${date.toLocaleDateString()}`
}

export default function TabOneScreen() {
    const { data: workouts = [], isLoading, isError } = useGetWorkouts()
    const { data: stats } = useGetWorkoutStats()
    const router = useRouter()

    const recentWorkouts = useMemo(() => {
        return [...workouts]
            .sort((a, b) => {
                const aTime = (a.lastWorkout ?? a.createdAt).getTime()
                const bTime = (b.lastWorkout ?? b.createdAt).getTime()

                return bTime - aTime
            })
            .slice(0, 4)
    }, [workouts])

    if (isLoading) {
        return <LoadingState title="Loading dashboard"/>
    }

    if (isError) {
        return (
            <StateView
                title="Could not load dashboard"
                description="The local workout database did not respond. Restart the app and try again."
                icon="alert-circle-outline"
            />
        )
    }

    return (
        <AppScreen contentStyle={styles.screenContent}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ScreenHeader
                    eyebrow="Workout tracker"
                    title="Work It"
                    description="Plan sessions, log sets, and keep your recent progress close at hand."
                    action={<AddWorkoutButton compact/>}
                />

                <View style={styles.section}>
                    <SectionHeader title="Training snapshot"/>
                    <View style={styles.statsGrid}>
                        <MetricCard label="Workouts" value={stats?.completedWorkouts ?? 0} icon="calendar-check-outline"/>
                        <MetricCard label="Logged sets" value={stats?.loggedSets ?? 0} icon="format-list-checks"/>
                        <MetricCard label="Volume" value={Math.round(stats?.totalVolume ?? 0)} icon="weight-kilogram"/>
                        <MetricCard label="Best score" value={stats?.bestSetScore ?? 0} icon="trophy-outline"/>
                    </View>
                </View>

                <View style={styles.section}>
                    <SectionHeader title="Recent workouts"/>
                    {recentWorkouts.length > 0 ? (
                        <FlatList
                            data={recentWorkouts}
                            scrollEnabled={false}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }: { item: Workout }) => (
                                <Card
                                    mode="contained"
                                    style={styles.workoutCard}
                                    onPress={() => router.navigate({
                                        pathname: '/(tabs)/workouts',
                                        params: { targetWorkoutId: item.id.toString() }
                                    })}
                                >
                                    <List.Item
                                        title={item.title}
                                        description={formatWorkoutDate(item.lastWorkout)}
                                        titleStyle={styles.workoutTitle}
                                        descriptionStyle={styles.workoutDescription}
                                        left={(props) => <List.Icon {...props} icon="dumbbell" color={palette.primary}/>}
                                        right={(props) => <List.Icon {...props} icon="chevron-right"/>}
                                    />
                                </Card>
                            )}
                            contentContainerStyle={styles.recentList}
                        />
                    ) : (
                        <Card mode="contained" style={styles.emptyCard}>
                            <Card.Content style={styles.emptyContent}>
                                <Text variant="titleMedium" style={styles.workoutTitle}>No workouts yet</Text>
                                <Text variant="bodyMedium" style={styles.workoutDescription}>Create a workout to start building a repeatable training routine.</Text>
                            </Card.Content>
                        </Card>
                    )}
                </View>

                <Button
                    mode="contained-tonal"
                    icon="arrow-right"
                    onPress={() => router.navigate('/(tabs)/workouts')}
                >
                    Open workouts
                </Button>
            </ScrollView>
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    screenContent: {
        paddingHorizontal: 0,
        paddingVertical: 0
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 18,
        gap: 20,
        flexGrow: 1
    },
    section: {
        gap: 12
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12
    },
    recentList: {
        gap: 10
    },
    workoutCard: {
        backgroundColor: palette.surface
    },
    workoutTitle: {
        color: palette.ink,
        fontWeight: '700'
    },
    workoutDescription: {
        color: palette.muted
    },
    emptyCard: {
        backgroundColor: palette.surfaceAlt
    },
    emptyContent: {
        gap: 4
    }
});
