import { TableRow, TableRowItem } from '@/components/ExerciseSetsTable/GenericTable'
import { Checkbox, Text, TextInput } from 'react-native-paper'
import { StyleSheet } from 'react-native'
import { useWorkoutProgressStore } from '@/store/useWorkoutProgressStore'
import { ExerciseProgressLogDetails } from '@/store/types'

interface ExerciseSetRowProps {
    exerciseSet: ExerciseProgressLogDetails
}

export const ExerciseSetRow = ({ exerciseSet }: ExerciseSetRowProps) => {
    const { setWeight, setReps, setCompleted } = useWorkoutProgressStore()

    const handleWeightChange = (weight: string = '0') => {
        const newWeight = weight === '' ? 0 : parseInt(weight)
        setWeight(exerciseSet.set, newWeight)
    }

    const handleRepsChange = (reps: string = '0') => {
        const newReps = reps === '' ? 0 : parseInt(reps)
        setReps(exerciseSet.set, newReps)
    }

    const toggleCompleted = () => {
        setCompleted(exerciseSet.set)
    }

    return (
        <TableRow>
            <TableRowItem dense={true}>
                <Text variant={'titleSmall'}>Set {exerciseSet.set}</Text>
            </TableRowItem>

            <TableRowItem>
                <TextInput
                    dense={true}
                    value={exerciseSet.weight?.toString() ?? '0'}
                    onChangeText={text => handleWeightChange(text)}
                    right={
                        <TextInput.Icon
                            icon={'close'}
                            size={16}
                            style={styles.icon}
                            onPress={() => handleWeightChange()}
                        />
                    }
                />
            </TableRowItem>

            <TableRowItem>
                <TextInput
                    dense={true}
                    value={exerciseSet.reps.toString() ?? '0'}
                    onChangeText={text => handleRepsChange(text)}
                    right={
                        <TextInput.Icon
                            icon={'close'}
                            size={16}
                            style={styles.icon}
                            onPress={() => handleRepsChange()}
                        />
                    }
                />
            </TableRowItem>

            <TableRowItem>
                <Checkbox
                    status={exerciseSet.isCompleted ? 'checked' : 'unchecked'}
                    onPress={toggleCompleted}
                />
            </TableRowItem>
        </TableRow>
    )
}

const styles = StyleSheet.create({
    icon: {
        marginRight: 0,
        paddingRight: 0
    }
})
