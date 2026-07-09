import { FlatList, Image, StyleProp, View, ViewStyle } from 'react-native'
import styles from '@/components/ExerciseList/styles'
import { ExerciseDetails } from '@/database/entities'
import { useGetExercisesWithTabs } from '@/hooks/exercises/useGetExercisesWithTabs'
import { getImageSource } from '@/components/utils/getImageSource'
import { ReactNode, useMemo, useState } from 'react'
import { Card, Chip, List, Searchbar, Text } from 'react-native-paper';
import { LoadingState, StateView } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'

interface ExerciseListProps {
    onExercisePress: (exerciseId: number) => void
    rightIcon?: (props: {
        exerciseId: number
        color: string
        style?: StyleProp<ViewStyle>
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

    if (isLoading) return <LoadingState title="Loading exercises"/>;
    if (isError) {
        return (
            <StateView
                title="Could not load exercises"
                description="Your exercise library could not be read from local storage."
                icon="alert-circle-outline"
            />
        )
    }

    if (exercises?.length === 0) {
        return (
            <StateView
                title="No exercises yet"
                description="Add exercises to build workouts and track set history."
                icon="arm-flex-outline"
            />
        )
    }

    return (
        <>
            <Searchbar
                placeholder="Search exercises"
                style={styles.searchBar}
                inputStyle={styles.searchInput}
                onChangeText={setSearchQuery}
                value={searchQuery}
            />
            <FlatList
                data={exerciseData}
                style={styles.list}
                contentContainerStyle={styles.container}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }: { item: ExerciseDetails }) => (
                    <Card
                        mode="contained"
                        style={styles.itemWrapper}
                        onPress={() => onExercisePress(item.id)}
                    >
                        <List.Item
                            containerStyle={styles.itemContents}
                            title={item.title}
                            titleStyle={styles.title}
                            description={() => (
                                <View style={styles.chips}>
                                    {item.tabs?.slice(0, 3).map((tab) => (
                                        <Chip key={tab.id} compact style={styles.chip} textStyle={styles.chipText}>
                                            {tab.name}
                                        </Chip>
                                    ))}
                                    {!item.tabs?.length && (
                                        <Text variant="bodySmall" style={styles.subtitle}>No muscle tags</Text>
                                    )}
                                </View>
                            )}
                            left={props => <Image {...props} source={getImageSource(item.photo)} style={styles.image}/>}
                            right={(props) => rightIcon?.({ exerciseId: item.id, color: palette.primary, style: props.style })}
                        />
                    </Card>
                )}
            />
        </>
    );
}
