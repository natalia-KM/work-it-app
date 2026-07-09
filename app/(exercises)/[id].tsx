import { useGetExercises } from '@/hooks/exercises/useGetExercises'
import { Appbar } from 'react-native-paper'
import { ScrollView, StyleSheet } from 'react-native'
import { useGetExerciseById } from '@/hooks/exercises/useGetExerciseById'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { EditExerciseForm } from '@/components/AddExerciseForm/EditExerciseForm'
import { useDeleteExercise } from '@/hooks/exercises/useDeleteExercise'
import { AppScreen, LoadingState, StateView } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'

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
                alert(error instanceof Error ? error.message : 'Error deleting an exercise')
                console.error(error)
            })
    }

    if (isExerciseLoading || isExerciseListLoading) {
        return <LoadingState title="Loading exercise"/>
    }

    if (isExerciseError || isExerciseListError || !exerciseData) {
        return (
            <StateView
                title="Could not load exercise"
                description="This exercise is unavailable."
                icon="alert-circle-outline"
            />
        )
    }

    return (
        <>
            <Appbar.Header style={styles.appbar}>
                <Appbar.BackAction onPress={() => router.navigate('/exercises')}/>
                <Appbar.Content title={exerciseData.title}/>
                {exerciseData.isCustom && <Appbar.Action icon="delete-outline" onPress={handleDelete}/>}
            </Appbar.Header>
            <AppScreen contentStyle={styles.screenContent}>
                <ScrollView contentContainerStyle={styles.container}>
                    <EditExerciseForm exercises={exercises} exerciseData={exerciseData}/>
                </ScrollView>
            </AppScreen>
        </>
    )
}

const styles = StyleSheet.create({
    appbar: {
        backgroundColor: palette.surface
    },
    screenContent: {
        paddingHorizontal: 0,
        paddingVertical: 0
    },
    container: {
        flexGrow: 1,
        padding: 20
    }
});
