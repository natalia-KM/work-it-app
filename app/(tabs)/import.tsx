import { useMemo, useState } from 'react'
import { Alert, ScrollView, StyleSheet } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Divider, IconButton, Switch, Text, TextInput } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { View } from '@/components/Themed'
import { ImportExercise, ImportExerciseLog, WorkoutNotesImport, workoutNotesImportSchema } from '@/database/importTypes'
import { useParseWorkoutNotes } from '@/hooks/imports/useParseWorkoutNotes'
import { useSaveWorkoutNotesImport } from '@/hooks/imports/useSaveWorkoutNotesImport'

const updateAt = <T,>(items: T[], index: number, updater: (item: T) => T) => {
    return items.map((item, itemIndex) => itemIndex === index ? updater(item) : item)
}

const removeAt = <T,>(items: T[], index: number) => items.filter((_, itemIndex) => itemIndex !== index)

const parseNumber = (value: string) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
}

const countImportItems = (parsedImport?: WorkoutNotesImport) => {
    if (!parsedImport) return { workouts: 0, exercises: 0, logs: 0 }

    return parsedImport.workouts.reduce((counts, workout) => {
        const logs = workout.exercises.reduce((total, exercise) => total + exercise.logs.length, 0)

        return {
            workouts: counts.workouts + 1,
            exercises: counts.exercises + workout.exercises.length,
            logs: counts.logs + logs
        }
    }, { workouts: 0, exercises: 0, logs: 0 })
}

export default function ImportWorkoutNotesScreen() {
    const [parsedImport, setParsedImport] = useState<WorkoutNotesImport>()
    const parseWorkoutNotes = useParseWorkoutNotes()
    const saveWorkoutNotesImport = useSaveWorkoutNotesImport()
    const router = useRouter()

    const counts = useMemo(() => countImportItems(parsedImport), [parsedImport])

    const pickAndParseFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'text/plain',
            copyToCacheDirectory: true,
            multiple: false
        })

        if (result.canceled || !result.assets[0]) return

        const file = result.assets[0]
        const text = await FileSystem.readAsStringAsync(file.uri)
        const parsed = await parseWorkoutNotes.mutateAsync({
            sourceName: file.name,
            text
        })

        setParsedImport(parsed)
    }

    const updateWorkout = (workoutIndex: number, updater: (workout: WorkoutNotesImport['workouts'][number]) => WorkoutNotesImport['workouts'][number]) => {
        setParsedImport((current) => current ? {
            ...current,
            workouts: updateAt(current.workouts, workoutIndex, updater)
        } : current)
    }

    const updateExercise = (workoutIndex: number, exerciseIndex: number, updater: (exercise: ImportExercise) => ImportExercise) => {
        updateWorkout(workoutIndex, (workout) => ({
            ...workout,
            exercises: updateAt(workout.exercises, exerciseIndex, updater)
        }))
    }

    const updateLog = (
        workoutIndex: number,
        exerciseIndex: number,
        logIndex: number,
        updater: (log: ImportExerciseLog) => ImportExerciseLog
    ) => {
        updateExercise(workoutIndex, exerciseIndex, (exercise) => ({
            ...exercise,
            logs: updateAt(exercise.logs, logIndex, updater)
        }))
    }

    const removeWorkout = (workoutIndex: number) => {
        setParsedImport((current) => current ? {
            ...current,
            workouts: removeAt(current.workouts, workoutIndex)
        } : current)
    }

    const removeExercise = (workoutIndex: number, exerciseIndex: number) => {
        updateWorkout(workoutIndex, (workout) => ({
            ...workout,
            exercises: removeAt(workout.exercises, exerciseIndex)
        }))
    }

    const removeLog = (workoutIndex: number, exerciseIndex: number, logIndex: number) => {
        updateExercise(workoutIndex, exerciseIndex, (exercise) => ({
            ...exercise,
            logs: removeAt(exercise.logs, logIndex)
        }))
    }

    const saveImport = async () => {
        if (!parsedImport) return

        try {
            const validImport = workoutNotesImportSchema.parse(parsedImport)
            const summary = await saveWorkoutNotesImport.mutateAsync(validImport)
            Alert.alert(
                'Import saved',
                `Added ${summary.workouts} workouts, ${summary.exercises} exercises, ${summary.logs} workout logs, and ${summary.exerciseLogs} exercise logs.`
            )
            router.navigate('/(tabs)/workouts')
        } catch (error) {
            Alert.alert('Import not saved', error instanceof Error ? error.message : 'Review the parsed data and try again.')
        }
    }

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text variant="headlineSmall">Import notes</Text>
                        <Text>Choose a workout note text file, review the AI cleanup, then save it as real workout history.</Text>
                    </View>
                    <Button
                        mode="contained"
                        icon="file-upload-outline"
                        loading={parseWorkoutNotes.isPending}
                        disabled={parseWorkoutNotes.isPending}
                        onPress={pickAndParseFile}
                    >
                        Select .txt
                    </Button>
                </View>

                {parseWorkoutNotes.error && (
                    <Text style={styles.errorText}>{parseWorkoutNotes.error.message}</Text>
                )}

                {parsedImport && (
                    <View style={styles.review}>
                        <View style={styles.summary}>
                            <Text variant="titleMedium">{parsedImport.sourceName}</Text>
                            {parsedImport.summary && <Text>{parsedImport.summary}</Text>}
                            <Text>{counts.workouts} workouts, {counts.exercises} exercises, {counts.logs} dated logs</Text>
                        </View>

                        {parsedImport.warnings.length > 0 && (
                            <View style={styles.warningBox}>
                                <Text variant="titleSmall">Review warnings</Text>
                                {parsedImport.warnings.map((warning, index) => (
                                    <Text key={`${warning}-${index}`}>- {warning}</Text>
                                ))}
                            </View>
                        )}

                        {parsedImport.workouts.map((workout, workoutIndex) => (
                            <View key={`${workout.title}-${workoutIndex}`} style={styles.workoutBlock}>
                                <View style={styles.rowBetween}>
                                    <Text variant="titleLarge">Workout</Text>
                                    <IconButton icon="delete-outline" onPress={() => removeWorkout(workoutIndex)}/>
                                </View>

                                <TextInput
                                    label="Workout title"
                                    value={workout.title}
                                    onChangeText={(title) => updateWorkout(workoutIndex, (item) => ({ ...item, title }))}
                                    style={styles.input}
                                />
                                <TextInput
                                    label="Workout notes"
                                    value={workout.notes ?? ''}
                                    onChangeText={(notes) => updateWorkout(workoutIndex, (item) => ({ ...item, notes }))}
                                    multiline
                                    style={styles.input}
                                />

                                {workout.exercises.map((exercise, exerciseIndex) => (
                                    <View key={`${exercise.title}-${exerciseIndex}`} style={styles.exerciseBlock}>
                                        <View style={styles.rowBetween}>
                                            <Text variant="titleMedium">Exercise</Text>
                                            <IconButton icon="delete-outline" onPress={() => removeExercise(workoutIndex, exerciseIndex)}/>
                                        </View>

                                        <TextInput
                                            label="Exercise title"
                                            value={exercise.title}
                                            onChangeText={(title) => updateExercise(workoutIndex, exerciseIndex, (item) => ({ ...item, title }))}
                                            style={styles.input}
                                        />
                                        <TextInput
                                            label="Setup cues"
                                            value={exercise.instructions ?? ''}
                                            onChangeText={(instructions) => updateExercise(workoutIndex, exerciseIndex, (item) => ({ ...item, instructions }))}
                                            multiline
                                            style={styles.input}
                                        />
                                        <TextInput
                                            label="Workout-specific notes"
                                            value={exercise.notes ?? ''}
                                            onChangeText={(notes) => updateExercise(workoutIndex, exerciseIndex, (item) => ({ ...item, notes }))}
                                            multiline
                                            style={styles.input}
                                        />

                                        <View style={styles.rowBetween}>
                                            <Text>Optional exercise</Text>
                                            <Switch
                                                value={exercise.isOptional}
                                                onValueChange={(isOptional) => updateExercise(workoutIndex, exerciseIndex, (item) => ({ ...item, isOptional }))}
                                            />
                                        </View>

                                        <View style={styles.targetRow}>
                                            <TextInput
                                                label="Sets"
                                                keyboardType="numeric"
                                                value={exercise.targetSets?.toString() ?? ''}
                                                onChangeText={(value) => updateExercise(workoutIndex, exerciseIndex, (item) => ({ ...item, targetSets: value ? Math.round(parseNumber(value)) : null }))}
                                                style={styles.targetInput}
                                            />
                                            <TextInput
                                                label="Reps"
                                                keyboardType="numeric"
                                                value={exercise.targetReps?.toString() ?? ''}
                                                onChangeText={(value) => updateExercise(workoutIndex, exerciseIndex, (item) => ({ ...item, targetReps: value ? Math.round(parseNumber(value)) : null }))}
                                                style={styles.targetInput}
                                            />
                                            <TextInput
                                                label="Weight"
                                                keyboardType="decimal-pad"
                                                value={exercise.targetWeight?.toString() ?? ''}
                                                onChangeText={(value) => updateExercise(workoutIndex, exerciseIndex, (item) => ({ ...item, targetWeight: value ? parseNumber(value) : null }))}
                                                style={styles.targetInput}
                                            />
                                        </View>

                                        {exercise.logs.map((log, logIndex) => (
                                            <View key={`${log.date}-${logIndex}`} style={styles.logBlock}>
                                                <View style={styles.rowBetween}>
                                                    <Text variant="titleSmall">{log.date}</Text>
                                                    <IconButton icon="close" onPress={() => removeLog(workoutIndex, exerciseIndex, logIndex)}/>
                                                </View>
                                                <TextInput
                                                    label="Session notes"
                                                    value={log.notes ?? ''}
                                                    onChangeText={(notes) => updateLog(workoutIndex, exerciseIndex, logIndex, (item) => ({ ...item, notes }))}
                                                    style={styles.input}
                                                />
                                                {log.sets.map((set, setIndex) => (
                                                    <View key={`${log.date}-${set.set}`} style={styles.setRow}>
                                                        <Text style={styles.setLabel}>Set {set.set}</Text>
                                                        <TextInput
                                                            label="Kg"
                                                            keyboardType="decimal-pad"
                                                            value={set.weight.toString()}
                                                            onChangeText={(value) => updateLog(workoutIndex, exerciseIndex, logIndex, (item) => ({
                                                                ...item,
                                                                sets: updateAt(item.sets, setIndex, (currentSet) => ({ ...currentSet, weight: parseNumber(value) }))
                                                            }))}
                                                            style={styles.setInput}
                                                        />
                                                        <TextInput
                                                            label="Reps"
                                                            keyboardType="numeric"
                                                            value={set.reps.toString()}
                                                            onChangeText={(value) => updateLog(workoutIndex, exerciseIndex, logIndex, (item) => ({
                                                                ...item,
                                                                sets: updateAt(item.sets, setIndex, (currentSet) => ({ ...currentSet, reps: Math.round(parseNumber(value)) }))
                                                            }))}
                                                            style={styles.setInput}
                                                        />
                                                    </View>
                                                ))}
                                            </View>
                                        ))}
                                    </View>
                                ))}
                                <Divider/>
                            </View>
                        ))}

                        <Button
                            mode="contained"
                            icon="content-save-outline"
                            loading={saveWorkoutNotesImport.isPending}
                            disabled={saveWorkoutNotesImport.isPending || counts.workouts === 0}
                            onPress={saveImport}
                        >
                            Save Import
                        </Button>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white'
    },
    container: {
        padding: 20,
        gap: 18
    },
    header: {
        gap: 14
    },
    headerText: {
        gap: 6
    },
    review: {
        gap: 16
    },
    summary: {
        gap: 6
    },
    warningBox: {
        gap: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: '#d97706',
        backgroundColor: '#fff7ed'
    },
    workoutBlock: {
        gap: 10
    },
    exerciseBlock: {
        gap: 10,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb'
    },
    logBlock: {
        gap: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
    },
    targetRow: {
        flexDirection: 'row',
        gap: 8
    },
    targetInput: {
        flex: 1
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    setLabel: {
        width: 50
    },
    setInput: {
        flex: 1
    },
    input: {
        backgroundColor: 'white'
    },
    errorText: {
        color: '#b91c1c'
    }
})

