import { FlatList, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Icon, List, Text } from 'react-native-paper'
import { useGetWorkouts } from '@/hooks/workouts/useGetWorkouts'
import { Workout } from '@/database/entities'
import { useRouter } from 'expo-router'
import { AddWorkoutButton } from '@/components/AddWorkoutButton/AddWorkoutButton'

export default function WorkoutsListScreen() {
    const { data: workouts, isError } = useGetWorkouts()
    const router = useRouter();

    if (!workouts || isError) {
        return null
    }

    if (workouts?.length === 0) {
        return (
            <View style={styles.noItemsFoundContainer}>
                <Icon source="sleep" size={64}/>
                <Text variant="titleLarge">No workouts found</Text>
                <Text style={styles.subtitle}>Start by creating your first workout to track your progress</Text>
                <AddWorkoutButton/>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={workouts}
                style={styles.list}
                contentContainerStyle={styles.listContainer}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }: { item: Workout }) => (
                    <List.Item
                        style={styles.itemWrapper}
                        title={item.title}
                        // onPress={() => router.push(`/(exercises)/${item.id.toString()}`)}
                        description={item.lastWorkout?.toString}
                    />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10
    },
    noItemsFoundContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        gap: 15
    },
    subtitle: {
        textAlign: 'center'
    },
    list: {
        flex: 1,
        width: '85%'
    },
    listContainer: {
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        paddingTop: 2
    },
    itemWrapper: {
        width: '98%',
        alignSelf: 'center',
        marginBottom: 12,
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.16)',
        paddingHorizontal: 4,
        paddingVertical: 0
    }
})