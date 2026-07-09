import { StyleSheet } from 'react-native';
import { ExerciseList } from '@/components/ExerciseList'
import { useRouter } from 'expo-router'
import { AppScreen, ScreenHeader } from '@/components/ui/Screen'

export default function ExerciseListingScreen() {
    const router = useRouter();

    return (
        <AppScreen contentStyle={styles.container}>
            <ScreenHeader
                eyebrow="Library"
                title="Exercises"
                description="Browse movements, muscle tags, and custom exercises."
            />
            <ExerciseList onExercisePress={(exerciseId) => router.push(`/(exercises)/${exerciseId.toString()}`)}/>
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 18
    }
});
