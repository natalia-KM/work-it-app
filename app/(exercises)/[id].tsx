import { useGetExercises } from '@/hooks/exercises/useGetExercises'
import { Appbar, Text } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View } from '@/components/Themed'
import { StyleSheet } from 'react-native'
import { useGetExerciseById } from '@/hooks/exercises/useGetExerciseById'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { EditExerciseForm } from '@/components/AddExerciseForm/EditExerciseForm'
import { useDeleteExercise } from '@/hooks/exercises/useDeleteExercise'

export default function EditExercise() {
    const { id: exerciseId } = useLocalSearchParams<{ id: string }>();

    const { data: exerciseData, isLoading: isExerciseLoading, isError: isExerciseError } = useGetExerciseById(
        Number(exerciseId))
    const { data: exercises = [], isLoading: isExerciseListLoading, isError: isExerciseListError } = useGetExercises()
    const { mutateAsync: deleteExercise } = useDeleteExercise()

    const router = useRouter();

    const handleDelete = async () => {
        await deleteExercise(Number(exerciseId))
            .then(() => {
                router.navigate('/exercises')
            })
            .catch((error) => {
                alert('Error deleting an exercise')
                console.error(error)
            })
    }

    if (isExerciseLoading || isExerciseListLoading) {
        return <Text>Loading...</Text>
    }

    if (isExerciseError || isExerciseListError || !exerciseData) {
        return <Text>Something went wrong...</Text>
    }

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.navigate('/exercises')}/>
                <Appbar.Content title={exerciseData.title}/>
                {exerciseData.isCustom && <Appbar.Action icon="delete-outline" onPress={handleDelete}/>}
            </Appbar.Header>
            <SafeAreaView style={styles.screen}>
                <View style={styles.container}>
                    <EditExerciseForm exercises={exercises} exerciseData={exerciseData}/>
                </View>
            </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white'
    },
    container: {
        paddingVertical: 0,
        paddingHorizontal: 25
    }
});
