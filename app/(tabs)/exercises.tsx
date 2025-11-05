import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { ExerciseList } from '@/components/ExerciseList'
import { useRouter } from 'expo-router'

export default function ExerciseListingScreen() {
    // TODO: update children to not set 85% width, rather the container should do it
    const router = useRouter();

    return (
        <View style={styles.container}>
            <ExerciseList onExercisePress={(exerciseId) => router.push(`/(exercises)/${exerciseId.toString()}`)}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10
    }
});
