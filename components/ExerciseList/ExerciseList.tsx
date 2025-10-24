import { FlatList, Image } from 'react-native'
import { ExerciseListProps } from '@/components/ExerciseList/types'
import styles from '@/components/ExerciseList/styles'
import { Text } from '@/components/Themed'
import { ExerciseDetails } from '@/database/entities'
import { useGetExercisesWithTabs } from '@/hooks/exercises/useGetExercisesWithTabs'
import { getImageSource } from '@/components/utils/getImageSource'
import { useMemo } from 'react'
import { List } from 'react-native-paper';

export const ExerciseList = ({ onSelectExercise, searchQuery }: ExerciseListProps) => {
    const { data: exercises, isLoading, isError } = useGetExercisesWithTabs();

    const renderItem = ({ item }: { item: ExerciseDetails }) => (
        <List.Item
            style={styles.itemWrapper}
            title={item.title}
            description={item.tabs.map((tab) => tab.name).join(', ')}
            left={props => <Image {...props} source={getImageSource(item.photo)} style={styles.image}/>}
        />
    );

    const exerciseData = useMemo(() => {
        if (exercises && exercises.length > 0 && searchQuery) {
            return exercises.filter(e =>
                e.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return exercises
    }, [exercises, searchQuery])

    if (isLoading) return <Text>Loading...</Text>;
    if (isError) return <Text>Error loading exercises</Text>;

    if (exercises?.length === 0) {
        return <Text>No exercises!</Text>;
    }

    return (
        <FlatList
            data={exerciseData}
            style={styles.list}
            contentContainerStyle={styles.container}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
        />
    );
}