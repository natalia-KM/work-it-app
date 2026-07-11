import { Appbar, Menu } from 'react-native-paper'
import { useState } from 'react'
import { useRouter } from 'expo-router'

//TODO: context for workoutId?
interface WorkoutDetailsMenuProps {
    workoutId: number
}

// Key passed to the Menu is a temporary workaround for a bug in RNP causing auto dismiss
// https://github.com/callstack/react-native-paper/issues/4807
export const WorkoutDetailsMenu = ({ workoutId }: WorkoutDetailsMenuProps) => {
    const [isMenuOpen, setMenuOpen] = useState(false)

    const router = useRouter()

    const handleAddExercises = () => {
        onClose()
        
        router.navigate({
            pathname: "/(workouts)/select-exercises",
            params: { workoutId }
        });
    };

    const handleEditTemplate = () => {
        onClose()

        router.navigate({
            pathname: "/(workouts)/edit-template",
            params: { workoutId }
        })
    }

    const handleOpenHistory = () => {
        onClose()

        router.navigate('/(workouts)/history')
    }

    const onClose = () => {
        setMenuOpen(false)
    }

    return (
        <Menu
            key={isMenuOpen.toString()}
            visible={isMenuOpen}
            anchor={<Appbar.Action icon={'dots-vertical'} onPress={() => setMenuOpen(true)}/>}
            anchorPosition={'bottom'}
            onDismiss={onClose}
        >
            <Menu.Item onPress={handleEditTemplate} title="Edit Template"/>
            <Menu.Item onPress={handleAddExercises} title="Add Exercises"/>
            <Menu.Item onPress={handleOpenHistory} title="History"/>
        </Menu>
    )
}
