import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { View } from '@/components/Themed'
import { AddWorkoutButton } from '@/components/AddWorkoutButton/AddWorkoutButton'

export const WorkoutDrawer = (props: DrawerContentComponentProps) => {

    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />

            <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
                <AddWorkoutButton/>
            </View>
        </DrawerContentScrollView>
    );
}