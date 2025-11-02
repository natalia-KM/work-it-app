import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { ExerciseList } from '@/components/ExerciseList'

export default function ExerciseListingScreen() {
    // TODO: update children to not set 85% width, rather the container should do it

    return (
        <View style={styles.container}>
            <ExerciseList/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10
    },
    searchBar: {
        width: '85%',
        marginVertical: 20
    }
});
