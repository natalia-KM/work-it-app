import { FlatList, Image } from 'react-native'
import { ExerciseListProps } from '@/components/ExerciseList/types'
import styles from '@/components/ExerciseList/styles'
import { Text, View } from '@/components/Themed'
import { ExerciseTab } from '@/database/entities'
import { useGetExercisesWithTabs } from '@/hooks/exercises/useGetExercisesWithTabs'
import { getImageSource } from '@/components/utils/getImageSource'

export const ExerciseList = ({ onSelectExercise }: ExerciseListProps) => {
    const { data: exercises, isLoading, isError } = useGetExercisesWithTabs();

    const renderItem = ({ item }: { item: ExerciseTab }) => (
        <View style={styles.itemWrapper}>
            <View style={styles.imageWrapper}>
                <Image source={getImageSource(item.photo)} style={styles.image}/>
            </View>
            <View style={styles.contentWrapper}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.tabs.map((tab) => tab.name).join(', ')}</Text>
            </View>
        </View>
    );

    if (isLoading) return <Text>Loading...</Text>;
    if (isError) return <Text>Error loading exercises</Text>;

    if (exercises?.length === 0) {
        return <Text>No exercises!</Text>;
    }
    return (
        <FlatList
            data={exercises}
            style={styles.list}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
        />
    );
}