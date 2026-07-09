import { Table, TableHeaderItem, TableRow, TableRowItem } from '@/components/ExerciseSetsTable/GenericTable'
import { Button } from 'react-native-paper'
import { useWorkoutProgressStore } from '@/store/useWorkoutProgressStore'
import { ExerciseSetRow } from '@/components/ExerciseSetsTable/ExerciseSetRow'

export const ExerciseSetsTable = () => {
    const { currentExerciseDetails, addSet } = useWorkoutProgressStore()

    if (currentExerciseDetails.length === 0) {
        return (
            <Button onPress={() => {
                addSet()
            }}>
                Add First Set
            </Button>
        )
    }

    return (
        <Table>
            <TableRow>
                <TableRowItem dense={true}></TableRowItem>
                <TableHeaderItem title={'Weight'}/>
                <TableHeaderItem title={'Reps'}/>
                <TableRowItem></TableRowItem>
            </TableRow>
            {currentExerciseDetails.map((exerciseSet, index) => (
                <ExerciseSetRow key={index} exerciseSet={exerciseSet}/>
            ))}

            <Button
                onPress={() => {
                    addSet()
                }}
            >
                + Add New Set
            </Button>
        </Table>
    )
}

