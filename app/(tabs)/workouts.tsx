import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Icon, Text } from 'react-native-paper'

export default function WorkoutsListScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.noItemsFoundContainer}>
                <Icon source="sleep" size={64}/>
                <Text variant="titleLarge">No workouts found</Text>
                <Text style={styles.subtitle}>Start by creating your first workout to track your progress</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10
    },
    noItemsFoundContainer: {
        width: '60%',
        alignItems: 'center',
        gap: 5
    },
    subtitle: {
        textAlign: 'center'
    }
})