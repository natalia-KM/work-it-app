import { FlatList, Image } from 'react-native'
import styles from '@/components/ExerciseList/styles'
import { Text } from '@/components/Themed'
import { ExerciseDetails } from '@/database/entities'
import { useGetExercisesWithTabs } from '@/hooks/exercises/useGetExercisesWithTabs'
import { getImageSource } from '@/components/utils/getImageSource'
import { ReactNode, useMemo, useState } from 'react'
import { List, Searchbar } from 'react-native-paper';
import { Style } from 'react-native-paper/src/components/List/utils'

interface ExerciseListProps {
    onExercisePress: (exerciseId: number) => void
    rightIcon?: (props: {
        exerciseId: number
        color: string
        style?: Style
    }) => ReactNode
}

export const ExerciseList = ({
    onExercisePress,
    rightIcon
}: ExerciseListProps) => {
    const [searchQuery, setSearchQuery] = useState('')

    const { data: exercises, isLoading, isError } = useGetExercisesWithTabs();

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
        <>
            <Searchbar
                placeholder="Search"
                style={styles.searchBar}
                onChangeText={setSearchQuery}
                value={searchQuery}
            />
            <FlatList
                data={exerciseData}
                style={styles.list}
                contentContainerStyle={styles.container}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }: { item: ExerciseDetails }) => (
                    <List.Item
                        style={styles.itemWrapper}
                        containerStyle={styles.itemContents}
                        title={item.title}
                        onPress={() => onExercisePress(item.id)}
                        description={item.tabs?.map((tab) => tab.name).join(', ')}
                        left={props => <Image {...props} source={getImageSource(item.photo)} style={styles.image}/>}
                        right={(props) => rightIcon?.({ exerciseId: item.id, ...props })}
                    />
                )}
            />
        </>
    );
}