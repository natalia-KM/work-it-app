import { ScrollView, StyleSheet, View } from 'react-native'
import { Button, Card, Divider, Modal, Portal, SegmentedButtons, Text } from 'react-native-paper'
import {
    ExerciseHistoryScope,
    useGetExerciseHistory
} from '@/hooks/logs/useGetExerciseHistory'
import { ExerciseHistoryItem } from '@/database/exerciseHistory'
import { palette } from '@/constants/theme'
import { useMemo, useState } from 'react'

interface ExerciseHistoryModalProps {
    visible: boolean
    onDismiss: () => void
    exerciseId?: number
    workoutId?: number
    exerciseTitle: string
}

const formatDate = (date?: Date | null) => {
    if (!date) return 'Date unavailable'

    return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

const formatNumber = (value: number) => Math.round(value).toLocaleString()

const HistoryEntry = ({
    item,
    showWorkoutTitle
}: {
    item: ExerciseHistoryItem
    showWorkoutTitle: boolean
}) => (
    <Card mode="contained" style={styles.entryCard}>
        <Card.Content style={styles.entryContent}>
            <View style={styles.entryHeader}>
                <View style={styles.entryTitleGroup}>
                    <Text variant="titleSmall" style={styles.entryTitle}>{formatDate(item.date)}</Text>
                    {showWorkoutTitle ? (
                        <Text variant="bodySmall" style={styles.entrySubtitle}>{item.workoutTitle}</Text>
                    ) : null}
                </View>
                <View style={styles.entryMetric}>
                    <Text variant="labelLarge" style={styles.metricValue}>{formatNumber(item.totalVolume)}</Text>
                    <Text variant="labelSmall" style={styles.metricLabel}>volume</Text>
                </View>
            </View>

            {item.notes ? (
                <Text variant="bodySmall" style={styles.notes}>{item.notes}</Text>
            ) : null}

            <View style={styles.setHeader}>
                <Text variant="labelSmall" style={styles.setHeaderText}>Set</Text>
                <Text variant="labelSmall" style={styles.setHeaderText}>Weight</Text>
                <Text variant="labelSmall" style={styles.setHeaderText}>Reps</Text>
                <Text variant="labelSmall" style={styles.setHeaderText}>Volume</Text>
            </View>
            <Divider/>
            {item.details.length > 0 ? item.details.map((set) => (
                <View key={`${item.exerciseLogId}-${set.set}`} style={styles.setRow}>
                    <Text variant="bodySmall" style={styles.setText}>{set.set}</Text>
                    <Text variant="bodySmall" style={styles.setText}>{set.weight}kg</Text>
                    <Text variant="bodySmall" style={styles.setText}>{set.reps}</Text>
                    <Text variant="bodySmall" style={styles.setText}>{formatNumber(set.volume)}</Text>
                </View>
            )) : (
                <Text variant="bodySmall" style={styles.emptyText}>No set details saved.</Text>
            )}

            <View style={styles.entryFooter}>
                <Text variant="labelSmall" style={styles.footerText}>Rest: {item.restTime}s</Text>
                <Text variant="labelSmall" style={styles.footerText}>Best: {item.bestAchieved ?? 'Not recorded'}</Text>
            </View>
        </Card.Content>
    </Card>
)

export const ExerciseHistoryModal = ({
    visible,
    onDismiss,
    exerciseId,
    workoutId,
    exerciseTitle
}: ExerciseHistoryModalProps) => {
    const [scope, setScope] = useState<ExerciseHistoryScope>('workout')
    const {
        data,
        isLoading,
        isError,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage
    } = useGetExerciseHistory({
        exerciseId,
        workoutId,
        scope
    })
    const history = useMemo(
        () => data?.pages.flat() ?? [],
        [data]
    )

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.modal}
            >
                <View style={styles.header}>
                    <View style={styles.titleGroup}>
                        <Text variant="labelLarge" style={styles.eyebrow}>Exercise history</Text>
                        <Text variant="titleLarge" style={styles.title}>{exerciseTitle}</Text>
                    </View>
                    <Button compact onPress={onDismiss}>Close</Button>
                </View>

                <SegmentedButtons
                    value={scope}
                    onValueChange={(value) => setScope(value as ExerciseHistoryScope)}
                    buttons={[
                        { value: 'workout', label: 'This workout' },
                        { value: 'all', label: 'All workouts' }
                    ]}
                />

                <ScrollView contentContainerStyle={styles.historyList}>
                    {isLoading ? (
                        <Text variant="bodyMedium" style={styles.emptyText}>Loading history...</Text>
                    ) : null}
                    {isError ? (
                        <Text variant="bodyMedium" style={styles.emptyText}>Could not load history.</Text>
                    ) : null}
                    {!isLoading && !isError && history.length === 0 ? (
                        <Text variant="bodyMedium" style={styles.emptyText}>No completed sessions found.</Text>
                    ) : null}
                    {!isLoading && !isError ? history.map((item) => (
                        <HistoryEntry
                            key={item.exerciseLogId}
                            item={item}
                            showWorkoutTitle={scope === 'all'}
                        />
                    )) : null}
                    {!isLoading && !isError && hasNextPage ? (
                        <Button
                            mode="contained-tonal"
                            onPress={() => fetchNextPage()}
                            loading={isFetchingNextPage}
                            disabled={isFetchingNextPage}
                        >
                            Show more
                        </Button>
                    ) : null}
                </ScrollView>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    modal: {
        marginHorizontal: 18,
        maxHeight: '86%',
        padding: 16,
        borderRadius: 8,
        backgroundColor: palette.surface,
        gap: 14
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12
    },
    titleGroup: {
        flex: 1,
        gap: 2
    },
    eyebrow: {
        color: palette.primaryDark,
        textTransform: 'uppercase',
        fontWeight: '800'
    },
    title: {
        color: palette.ink,
        fontWeight: '800'
    },
    historyList: {
        gap: 12,
        paddingBottom: 4
    },
    entryCard: {
        backgroundColor: palette.surfaceAlt
    },
    entryContent: {
        gap: 10
    },
    entryHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12
    },
    entryTitleGroup: {
        flex: 1,
        gap: 2
    },
    entryTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    entrySubtitle: {
        color: palette.muted
    },
    entryMetric: {
        minWidth: 72,
        alignItems: 'flex-end'
    },
    metricValue: {
        color: palette.primaryDark,
        fontWeight: '800'
    },
    metricLabel: {
        color: palette.muted
    },
    notes: {
        color: palette.muted,
        lineHeight: 18
    },
    setHeader: {
        flexDirection: 'row',
        gap: 8
    },
    setHeaderText: {
        flex: 1,
        color: palette.muted,
        fontWeight: '800'
    },
    setRow: {
        flexDirection: 'row',
        gap: 8
    },
    setText: {
        flex: 1,
        color: palette.ink
    },
    emptyText: {
        color: palette.muted,
        lineHeight: 20
    },
    entryFooter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    footerText: {
        color: palette.muted,
        fontWeight: '700'
    }
})
