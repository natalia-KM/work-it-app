import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import * as Sharing from 'expo-sharing'
import { Button, Card, Chip, Text } from 'react-native-paper'
import { useCreateBackupExport } from '@/hooks/backup/useCreateBackupExport'
import { AppScreen, ScreenHeader } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'

const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`

    return `${(bytes / 1024).toFixed(1)} KB`
}

export default function DataScreen() {
    const createBackupExport = useCreateBackupExport()
    const backup = createBackupExport.data

    const exportBackup = async () => {
        try {
            const result = await createBackupExport.mutateAsync()
            Alert.alert('Backup exported', result.filename)
        } catch (error) {
            Alert.alert(
                'Export failed',
                error instanceof Error ? error.message : 'The backup file could not be created.'
            )
        }
    }

    const shareBackup = async () => {
        if (!backup) return

        const isSharingAvailable = await Sharing.isAvailableAsync()

        if (!isSharingAvailable) {
            Alert.alert('Sharing unavailable', 'The backup file was created, but this device cannot open a share sheet.')
            return
        }

        await Sharing.shareAsync(backup.uri, {
            mimeType: 'application/json',
            dialogTitle: backup.filename,
            UTI: 'public.json'
        })
    }

    return (
        <AppScreen contentStyle={styles.screenContent}>
            <ScrollView contentContainerStyle={styles.container}>
                <ScreenHeader
                    eyebrow="Local data"
                    title="Data"
                    description="Export a JSON backup of workouts, exercises, logs, and active workout progress."
                    action={(
                        <Button
                            mode="contained"
                            icon="database-export-outline"
                            loading={createBackupExport.isPending}
                            disabled={createBackupExport.isPending}
                            onPress={exportBackup}
                        >
                            Export
                        </Button>
                    )}
                />

                <Card mode="contained" style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <View style={styles.rowBetween}>
                            <View style={styles.titleGroup}>
                                <Text variant="titleMedium" style={styles.cardTitle}>JSON backup</Text>
                                <Text variant="bodyMedium" style={styles.mutedText}>
                                    Restore support can use this file format in a later release.
                                </Text>
                            </View>
                            <Chip compact style={styles.versionChip}>v1</Chip>
                        </View>

                        {backup ? (
                            <View style={styles.result}>
                                <View style={styles.summaryRow}>
                                    <Chip compact style={styles.summaryChip}>
                                        {backup.payload.data.workouts.length} workouts
                                    </Chip>
                                    <Chip compact style={styles.summaryChip}>
                                        {backup.payload.data.exercises.length} exercises
                                    </Chip>
                                    <Chip compact style={styles.summaryChip}>
                                        {backup.payload.data.workoutLogs.length} logs
                                    </Chip>
                                </View>
                                <View style={styles.fileBlock}>
                                    <Text variant="labelLarge" style={styles.fileName}>{backup.filename}</Text>
                                    <Text selectable style={styles.fileUri}>{backup.uri}</Text>
                                    <Text style={styles.mutedText}>{formatBytes(backup.bytes)}</Text>
                                </View>
                                <Button mode="outlined" icon="share-variant-outline" onPress={shareBackup}>
                                    Share
                                </Button>
                            </View>
                        ) : (
                            <Text style={styles.mutedText}>No backup exported in this session.</Text>
                        )}
                    </Card.Content>
                </Card>
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
    card: {
        backgroundColor: palette.surface
    },
    cardContent: {
        gap: 16
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12
    },
    titleGroup: {
        flex: 1,
        gap: 4
    },
    cardTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    mutedText: {
        color: palette.muted,
        lineHeight: 20
    },
    versionChip: {
        backgroundColor: palette.surfaceAlt
    },
    result: {
        gap: 14
    },
    summaryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    summaryChip: {
        backgroundColor: palette.surfaceAlt
    },
    fileBlock: {
        gap: 4,
        padding: 12,
        borderWidth: 1,
        borderColor: palette.line,
        borderRadius: 8,
        backgroundColor: palette.background
    },
    fileName: {
        color: palette.ink,
        fontWeight: '800'
    },
    fileUri: {
        color: palette.muted,
        lineHeight: 18
    }
})
