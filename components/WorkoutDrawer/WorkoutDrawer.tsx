import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { StyleSheet, View } from 'react-native'
import { AddWorkoutButton } from '@/components/AddWorkoutButton/AddWorkoutButton'
import { Text } from 'react-native-paper'
import { palette } from '@/constants/theme'

export const WorkoutDrawer = (props: DrawerContentComponentProps) => {

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text variant="labelLarge" style={styles.eyebrow}>Workouts</Text>
                <Text variant="titleLarge" style={styles.title}>Training plans</Text>
            </View>
            <DrawerItemList {...props} />

            <View style={styles.action}>
                <AddWorkoutButton/>
            </View>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingTop: 12
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 4
    },
    eyebrow: {
        color: palette.primary,
        textTransform: 'uppercase'
    },
    title: {
        color: palette.ink,
        fontWeight: '800'
    },
    action: {
        marginTop: 20,
        paddingHorizontal: 16
    }
})
