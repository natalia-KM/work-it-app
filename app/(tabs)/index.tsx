import { FlatList, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { ActivityIndicator, Button, List } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useGetWorkouts } from '@/hooks/workouts/useGetWorkouts'
import { AddWorkoutButton } from '@/components/AddWorkoutButton/AddWorkoutButton'
import { Workout } from '@/database/entities'
import { useGetWorkoutStats } from '@/hooks/logs/useGetWorkoutStats'

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
        return (
            <View style={styles.centered}>
                <ActivityIndicator/>
            </View>
        )
    }

    if (isError) {
        return (
            <View style={styles.centered}>
                <Text>Could not load dashboard</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <Text style={styles.title}>Work It</Text>
                <AddWorkoutButton/>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stats</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats?.completedWorkouts ?? 0}</Text>
                        <Text>Workouts</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats?.loggedSets ?? 0}</Text>
                        <Text>Sets</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{Math.round(stats?.totalVolume ?? 0)}</Text>
                        <Text>Volume</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats?.bestSetScore ?? 0}</Text>
                        <Text>Best</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent workouts</Text>
                {recentWorkouts.length > 0 ? (
                    <FlatList
                        data={recentWorkouts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }: { item: Workout }) => (
                            <List.Item
                                title={item.title}
                                description={formatWorkoutDate(item.lastWorkout)}
                                left={(props) => <List.Icon {...props} icon="dumbbell"/>}
                                right={(props) => <List.Icon {...props} icon="chevron-right"/>}
                                onPress={() => router.navigate({
                                    pathname: '/(tabs)/workouts',
                                    params: { targetWorkoutId: item.id.toString() }
                                })}
                            />
                        )}
                    />
                ) : (
                    <Text style={styles.emptyText}>No workouts yet</Text>
                )}
            </View>

            <Button
                mode="outlined"
                onPress={() => router.navigate('/(tabs)/workouts')}
            >
                Open workouts
            </Button>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
        gap: 20
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold'
    },
    section: {
        gap: 8
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600'
    },
    emptyText: {
        marginTop: 8
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    statItem: {
        width: '47%',
        minHeight: 74,
        justifyContent: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700'
    }
});
