import { FlatList, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { List } from 'react-native-paper'
import { useGetWorkouts } from '@/hooks/workouts/useGetWorkouts'
import { Workout } from '@/database/entities'
import { useRouter } from 'expo-router'
import { AddWorkoutButton } from '@/components/AddWorkoutButton/AddWorkoutButton'
import { NoItemsFound } from '@/components/NoItemsFound'

export default function WorkoutsListScreen() {
    const { data: workouts, isError } = useGetWorkouts()
    const router = useRouter();

    if (!workouts || isError) {
        return null
    }

    if (workouts?.length === 0) {
        return (
            <NoItemsFound
                title={'No workouts found'}
                description={'Start by creating your first workout to track your progress'}
                ActionButton={<AddWorkoutButton/>}
            />
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
                        style={[
                            styles.itemWrapper,
                            {
                                borderTopWidth: 0,
                                borderRightWidth: 0,
                                borderBottomWidth: 0,
                                borderLeftWidth: 10,
                                borderLeftColor: item.color ?? 'transparent'
                            }
                        ]}
                        title={item.title}
                        onPress={() => router.push(`/(workouts)/${item.id.toString()}`)}
                        description={item.lastWorkout?.toString}
                    />
                )}
            />
            <AddWorkoutButton/>
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
    list: {
        flex: 1,
        width: '85%'
    },
    listContainer: {
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        paddingTop: 15
    },
    itemWrapper: {
        width: '98%',
        alignSelf: 'center',
        marginBottom: 12,
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.16)',
        paddingHorizontal: 4,
        paddingVertical: 10,
        borderRadius: 5
    }
})