import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function TabOneScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Work It</Text>
            <Text style={styles.subtitle}>Track workouts and progress.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    subtitle: {
        marginTop: 8
    }
});
