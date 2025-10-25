import { Button, Card, Text } from 'react-native-paper'
import { Icon } from 'react-native-paper/src'
import { View } from '@/components/Themed'
import { StyleSheet } from 'react-native'

export const ExerciseImageUpload = () => {
    return (
        <Card mode={'outlined'} style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <Icon
                    source="cloud-arrow-up-outline"
                    size={48}
                />

                <View style={styles.cardText}>
                    <Text>Upload Exercise Cover Image</Text>
                    <Text variant={'labelMedium'}>(max 2MB)</Text>
                </View>

                <Button icon={'tray-arrow-up'} mode={'contained'} onPress={() => {
                }}>
                    Select File
                </Button>
            </Card.Content>
        </Card>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'transparent'
    },
    cardText: {
        alignItems: 'center'
    },
    cardContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    }
});
