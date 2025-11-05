import { useGetWorkoutExercises } from '@/hooks/workouts/useGetWorkoutExercises'
import { Button, List, Text } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { Image, StyleSheet } from 'react-native'
import { NoItemsFound } from '@/components/NoItemsFound'
import { View } from '@/components/Themed'
import { getImageSource } from '@/components/utils/getImageSource'

interface WorkoutExercisesProps {
    workoutId: number
}

export const WorkoutExercises = ({ workoutId }: WorkoutExercisesProps) => {
    const { data: exercises, isError: isExerciseError } = useGetWorkoutExercises(workoutId)

    const router = useRouter()

    const handleAddExercises = () => {
        router.push({
            pathname: "/(workouts)/select-exercises",
            params: { workoutId }
        });
    };


    if (isExerciseError || !exercises) {
        return <Text>Could not load exercises</Text>
    }

    if (exercises.length === 0) {
        return (
            <NoItemsFound
                title={'This workout is empty'}
                description={'Start building your workout by adding exercises'}
                ActionButton={
                    <Button
                        onPress={handleAddExercises}
                        mode="contained"
                    >
                        Add Exercises
                    </Button>
                }
            />
        )
    }

    return (
        <View style={styles.list}>
            {exercises.map(exercise => (
                <List.Accordion
                    key={exercise.id}
                    title={exercise.title}
                    id={exercise.id.toString()}
                    style={styles.itemWrapper}
                    containerStyle={styles.accordionWrapper}
                    left={props => <Image {...props} source={getImageSource(exercise.photo)} style={styles.image}/>}
                >
                    <View>
                        <Text>Item 1</Text>
                    </View>
                </List.Accordion>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
        width: '85%',
        marginTop: 10,
        gap: 15
    },
    container: {
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        paddingTop: 2
    },
    accordionWrapper: {
        alignItems: 'center'
    },
    itemWrapper: {
        width: '98%',
        alignSelf: 'center',
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.16)',
        backgroundColor: 'white',
        paddingHorizontal: 6,
        paddingVertical: 2
    },
    image: {
        width: 48,
        height: 48,
        marginRight: 6,
        marginLeft: 4
    }
})