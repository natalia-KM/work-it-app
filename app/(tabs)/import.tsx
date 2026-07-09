import { useMemo, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Button, Card, Chip, Divider, IconButton, Switch, Text, TextInput } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { ImportExercise, ImportExerciseLog, WorkoutNotesImport, workoutNotesImportSchema } from '@/database/importTypes'
import { useParseWorkoutNotes } from '@/hooks/imports/useParseWorkoutNotes'
import { useSaveWorkoutNotesImport } from '@/hooks/imports/useSaveWorkoutNotesImport'
import { AppScreen, ScreenHeader } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'

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
        <AppScreen contentStyle={styles.screenContent}>
            <ScrollView contentContainerStyle={styles.container}>
                <ScreenHeader
                    eyebrow="AI import"
                    title="Import notes"
                    description="Choose a workout note text file, review the cleanup, then save it as workout history."
                    action={(
                        <Button
                            mode="contained"
                            icon="file-upload-outline"
                            loading={parseWorkoutNotes.isPending}
                            disabled={parseWorkoutNotes.isPending}
                            onPress={pickAndParseFile}
                        >
                            Select .txt
                        </Button>
                    )}
                />

                {parseWorkoutNotes.error && (
                    <Card mode="contained" style={styles.errorBox}>
                        <Card.Content>
                            <Text style={styles.errorText}>{parseWorkoutNotes.error.message}</Text>
                        </Card.Content>
                    </Card>
                )}

                {parsedImport && (
                    <View style={styles.review}>
                        <Card mode="contained" style={styles.summary}>
                            <Card.Content style={styles.summaryContent}>
                            <Text variant="titleMedium" style={styles.blockTitle}>{parsedImport.sourceName}</Text>
                            {parsedImport.summary && <Text>{parsedImport.summary}</Text>}
                                <View style={styles.countRow}>
                                    <Chip compact style={styles.summaryChip}>{counts.workouts} workouts</Chip>
                                    <Chip compact style={styles.summaryChip}>{counts.exercises} exercises</Chip>
                                    <Chip compact style={styles.summaryChip}>{counts.logs} dated logs</Chip>
                                </View>
                            </Card.Content>
                        </Card>

                        {parsedImport.warnings.length > 0 && (
                            <Card mode="contained" style={styles.warningBox}>
                                <Card.Content style={styles.warningContent}>
                                <Text variant="titleSmall" style={styles.warningTitle}>Review warnings</Text>
                                {parsedImport.warnings.map((warning, index) => (
                                    <Text key={`${warning}-${index}`} style={styles.warningText}>- {warning}</Text>
                                ))}
                                </Card.Content>
                            </Card>
                        )}

                        {parsedImport.workouts.map((workout, workoutIndex) => (
                            <View key={`${workout.title}-${workoutIndex}`} style={styles.workoutBlock}>
                                <View style={styles.rowBetween}>
                                    <Text variant="titleLarge" style={styles.blockTitle}>Workout</Text>
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
                                            <Text variant="titleMedium" style={styles.blockTitle}>Exercise</Text>
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
                                            <Text style={styles.fieldLabel}>Optional exercise</Text>
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
                                                    <Text variant="titleSmall" style={styles.blockTitle}>{log.date}</Text>
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
                                <Divider style={styles.divider}/>
                            </View>
                        ))}

                        <Button
                            mode="contained"
                            icon="content-save-outline"
                            contentStyle={styles.saveButton}
                            loading={saveWorkoutNotesImport.isPending}
                            disabled={saveWorkoutNotesImport.isPending || counts.workouts === 0}
                            onPress={saveImport}
                        >
                            Save import
                        </Button>
                    </View>
                )}
            </ScrollView>
        </AppScreen>
    )
}

const styles = StyleSheet.create({
    screenContent: {
        paddingHorizontal: 0,
        paddingVertical: 0
    },
    container: {
        padding: 20,
        gap: 18
    },
    review: {
        gap: 16
    },
    summary: {
        backgroundColor: palette.surface
    },
    summaryContent: {
        gap: 6
    },
    countRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingTop: 6
    },
    summaryChip: {
        backgroundColor: palette.surfaceAlt
    },
    warningBox: {
        backgroundColor: '#FFF7ED'
    },
    warningContent: {
        gap: 6
    },
    warningTitle: {
        color: palette.warning,
        fontWeight: '800'
    },
    warningText: {
        color: '#7C2D12'
    },
    workoutBlock: {
        gap: 10,
        padding: 16,
        borderRadius: 8,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.line
    },
    exerciseBlock: {
        gap: 10,
        padding: 12,
        borderRadius: 8,
        backgroundColor: palette.surfaceAlt
    },
    logBlock: {
        gap: 8,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: palette.line,
        backgroundColor: palette.surface
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
        width: 50,
        color: palette.muted
    },
    setInput: {
        flex: 1
    },
    input: {
        backgroundColor: palette.surface
    },
    errorText: {
        color: palette.error
    },
    errorBox: {
        backgroundColor: '#FEE4E2'
    },
    blockTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    fieldLabel: {
        color: palette.ink,
        fontWeight: '600'
    },
    divider: {
        backgroundColor: palette.line
    },
    saveButton: {
        minHeight: 50
    }
})

