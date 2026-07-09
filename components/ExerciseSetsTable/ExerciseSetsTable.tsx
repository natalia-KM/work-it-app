import { Table, TableHeaderItem, TableRow, TableRowItem } from '@/components/ExerciseSetsTable/GenericTable'
import { Button } from 'react-native-paper'
import { useWorkoutProgressStore } from '@/store/useWorkoutProgressStore'
import { ExerciseSetRow } from '@/components/ExerciseSetsTable/ExerciseSetRow'
import { StyleSheet } from 'react-native'

export const ExerciseSetsTable = () => {
    const { currentExerciseDetails, addSet } = useWorkoutProgressStore()

    if (currentExerciseDetails.length === 0) {
        return (
            <Button mode="contained-tonal" icon="plus" contentStyle={styles.buttonContent} onPress={() => {
                addSet()
            }}>
                Add first set
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
                mode="contained-tonal"
                icon="plus"
                contentStyle={styles.buttonContent}
                onPress={() => {
                    addSet()
                }}
            >
                Add new set
            </Button>
        </Table>
    )
}

const styles = StyleSheet.create({
    buttonContent: {
        minHeight: 44
    }
})

