import { ReactNode, useEffect, useMemo, useRef } from 'react'
import { Alert, Animated, Easing, FlatList, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { Button, Card, Icon, List, Text } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useGetWorkouts } from '@/hooks/workouts/useGetWorkouts'
import { AddWorkoutButton } from '@/components/AddWorkoutButton/AddWorkoutButton'
import { Workout } from '@/database/entities'
import { useGetWorkoutStats } from '@/hooks/logs/useGetWorkoutStats'
import { AppScreen, LoadingState, ScreenHeader, SectionHeader, StateView } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'
import { ExerciseVolumeStat, WorkoutTrendPoint } from '@/database/stats'
import { useDeleteActiveWorkoutDraft, useGetActiveWorkoutDraft } from '@/hooks/workouts/useActiveWorkoutDraft'
import { ActiveWorkoutDraft, useWorkoutProgressStore } from '@/store'

const formatWorkoutDate = (date?: Date | null) => {
    if (!date) return 'Not completed yet'

    return `Last: ${date.toLocaleDateString()}`
}

const formatCompactNumber = (value: number) => {
    const rounded = Math.round(value)
    const absolute = Math.abs(rounded)

    if (absolute >= 1_000_000) return `${(rounded / 1_000_000).toFixed(1)}m`
    if (absolute >= 10_000) return `${Math.round(rounded / 1_000)}k`
    if (absolute >= 1_000) return `${(rounded / 1_000).toFixed(1)}k`

    return rounded.toString()
}

const formatDuration = (seconds: number) => {
    if (seconds <= 0) return '0m'

    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return `${minutes}m`

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

const formatDelta = (value: number) => {
    if (value === 0) return 'flat'

    const prefix = value > 0 ? '+' : ''

    return `${prefix}${Math.round(value)}%`
}

const formatDraftStartedAt = (date: Date) => {
    return `Started ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    })}`
}

interface AnimatedRevealProps {
    children: ReactNode
    delay?: number
    style?: StyleProp<ViewStyle>
}

const AnimatedReveal = ({ children, delay = 0, style }: AnimatedRevealProps) => {
    const progress = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 520,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
        }).start()
    }, [delay, progress])

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: progress,
                    transform: [{
                        translateY: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [18, 0]
                        })
                    }]
                }
            ]}
        >
            {children}
        </Animated.View>
    )
}

interface MetricTileProps {
    label: string
    value: string | number
    icon: string
    color: string
    delay: number
    note?: string
}

const MetricTile = ({ label, value, icon, color, delay, note }: MetricTileProps) => (
    <AnimatedReveal delay={delay} style={styles.metricTile}>
        <Card mode="contained" style={styles.metricCard}>
            <Card.Content style={styles.metricContent}>
                <View style={[styles.metricIcon, { backgroundColor: `${color}1A` }]}>
                    <Icon source={icon} size={21} color={color}/>
                </View>
                <Text variant="headlineSmall" style={styles.metricValue}>{value}</Text>
                <Text variant="labelMedium" style={styles.metricLabel}>{label}</Text>
                {note ? <Text variant="labelSmall" style={styles.metricNote}>{note}</Text> : null}
            </Card.Content>
        </Card>
    </AnimatedReveal>
)

interface AnimatedProgressBarProps {
    ratio: number
    color: string
}

const AnimatedProgressBar = ({ ratio, color }: AnimatedProgressBarProps) => {
    const progress = useRef(new Animated.Value(0)).current
    const boundedRatio = Math.max(0, Math.min(ratio, 1))

    useEffect(() => {
        progress.setValue(0)
        Animated.timing(progress, {
            toValue: boundedRatio,
            duration: 740,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
        }).start()
    }, [boundedRatio, progress])

    return (
        <View style={styles.progressTrack}>
            <Animated.View
                style={[
                    styles.progressFill,
                    {
                        backgroundColor: color,
                        transform: [{ scaleX: progress }]
                    }
                ]}
            />
        </View>
    )
}

interface DailyTrendChartProps {
    data: WorkoutTrendPoint[]
}

const DailyTrendChart = ({ data }: DailyTrendChartProps) => {
    const maxVolume = Math.max(...data.map((item) => item.volume), 1)

    return (
        <Card mode="contained" style={styles.panelCard}>
            <Card.Content style={styles.chartContent}>
                <View style={styles.panelHeader}>
                    <View>
                        <Text variant="titleMedium" style={styles.panelTitle}>7-day load</Text>
                        <Text variant="bodySmall" style={styles.panelSubtle}>Volume by training day</Text>
                    </View>
                    <Icon source="chart-bar" size={24} color={palette.accent}/>
                </View>

                <View style={styles.barChart}>
                    {data.map((item, index) => (
                        <DailyTrendBar
                            key={item.key}
                            item={item}
                            maxVolume={maxVolume}
                            delay={index * 55}
                        />
                    ))}
                </View>
            </Card.Content>
        </Card>
    )
}

interface DailyTrendBarProps {
    item: WorkoutTrendPoint
    maxVolume: number
    delay: number
}

const DailyTrendBar = ({ item, maxVolume, delay }: DailyTrendBarProps) => {
    const progress = useRef(new Animated.Value(0)).current
    const targetHeight = 12 + Math.round((item.volume / maxVolume) * 92)

    useEffect(() => {
        progress.setValue(0)
        Animated.timing(progress, {
            toValue: targetHeight,
            duration: 620,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false
        }).start()
    }, [delay, progress, targetHeight])

    return (
        <View style={styles.barItem}>
            <View style={styles.barTrack}>
                <Animated.View
                    style={[
                        styles.barFill,
                        {
                            height: progress,
                            backgroundColor: item.workouts > 0 ? palette.primary : palette.line
                        }
                    ]}
                />
            </View>
            <Text variant="labelSmall" style={styles.barLabel}>{item.label}</Text>
        </View>
    )
}

interface MomentumPanelProps {
    currentStreakDays: number
    longestStreakDays: number
    thisWeekWorkouts: number
    sevenDayVolumeChangePercent: number
    averageDurationSeconds: number
    bestSessionTitle?: string
    bestSessionVolume?: number
}

const MomentumPanel = ({
    currentStreakDays,
    longestStreakDays,
    thisWeekWorkouts,
    sevenDayVolumeChangePercent,
    averageDurationSeconds,
    bestSessionTitle,
    bestSessionVolume
}: MomentumPanelProps) => {
    const weeklyTargetRatio = thisWeekWorkouts / 4
    const deltaColor = sevenDayVolumeChangePercent >= 0 ? palette.success : palette.error

    return (
        <Card mode="contained" style={styles.heroCard}>
            <Card.Content style={styles.heroContent}>
                <View style={styles.heroTopRow}>
                    <View>
                        <Text variant="labelLarge" style={styles.heroEyebrow}>Momentum</Text>
                        <Text variant="displaySmall" style={styles.heroNumber}>{currentStreakDays}</Text>
                        <Text variant="titleMedium" style={styles.heroTitle}>day streak</Text>
                    </View>
                    <View style={styles.deltaBadge}>
                        <Icon source={sevenDayVolumeChangePercent >= 0 ? 'trending-up' : 'trending-down'} size={18} color={deltaColor}/>
                        <Text variant="labelLarge" style={[styles.deltaText, { color: deltaColor }]}>
                            {formatDelta(sevenDayVolumeChangePercent)}
                        </Text>
                    </View>
                </View>

                <View style={styles.heroStats}>
                    <View style={styles.heroStatItem}>
                        <Text variant="titleMedium" style={styles.heroStatValue}>{longestStreakDays}</Text>
                        <Text variant="labelSmall" style={styles.heroStatLabel}>best streak</Text>
                    </View>
                    <View style={styles.heroStatItem}>
                        <Text variant="titleMedium" style={styles.heroStatValue}>{formatDuration(averageDurationSeconds)}</Text>
                        <Text variant="labelSmall" style={styles.heroStatLabel}>avg session</Text>
                    </View>
                    <View style={styles.heroStatItem}>
                        <Text variant="titleMedium" style={styles.heroStatValue}>{thisWeekWorkouts}</Text>
                        <Text variant="labelSmall" style={styles.heroStatLabel}>this week</Text>
                    </View>
                </View>

                <View style={styles.heroProgress}>
                    <View style={styles.progressLabelRow}>
                        <Text variant="labelMedium" style={styles.heroMuted}>Weekly rhythm</Text>
                        <Text variant="labelMedium" style={styles.heroMuted}>{Math.min(thisWeekWorkouts, 4)}/4</Text>
                    </View>
                    <AnimatedProgressBar ratio={weeklyTargetRatio} color={palette.accent}/>
                </View>

                {bestSessionTitle ? (
                    <View style={styles.bestSessionRow}>
                        <Icon source="lightning-bolt-outline" size={18} color={palette.accent}/>
                        <Text variant="bodySmall" style={styles.bestSessionText} numberOfLines={2}>
                            Best load: {bestSessionTitle} at {formatCompactNumber(bestSessionVolume ?? 0)}
                        </Text>
                    </View>
                ) : null}
            </Card.Content>
        </Card>
    )
}

interface TopExercisesPanelProps {
    exercises: ExerciseVolumeStat[]
}

const TopExercisesPanel = ({ exercises }: TopExercisesPanelProps) => {
    const maxVolume = Math.max(...exercises.map((exercise) => exercise.volume), 1)

    return (
        <Card mode="contained" style={styles.panelCard}>
            <Card.Content style={styles.topExercisesContent}>
                <View style={styles.panelHeader}>
                    <View>
                        <Text variant="titleMedium" style={styles.panelTitle}>Top movers</Text>
                        <Text variant="bodySmall" style={styles.panelSubtle}>Highest lifetime volume</Text>
                    </View>
                    <Icon source="arm-flex-outline" size={24} color={palette.primary}/>
                </View>

                {exercises.length > 0 ? exercises.map((exercise, index) => (
                    <ExerciseVolumeRow
                        key={exercise.exerciseId}
                        exercise={exercise}
                        ratio={exercise.volume / maxVolume}
                        rank={index + 1}
                    />
                )) : (
                    <View style={styles.emptyAnalytics}>
                        <Text variant="bodyMedium" style={styles.emptyAnalyticsText}>Log a workout to start ranking exercises.</Text>
                    </View>
                )}
            </Card.Content>
        </Card>
    )
}

interface ExerciseVolumeRowProps {
    exercise: ExerciseVolumeStat
    ratio: number
    rank: number
}

const ExerciseVolumeRow = ({ exercise, ratio, rank }: ExerciseVolumeRowProps) => (
    <View style={styles.exerciseRow}>
        <View style={styles.exerciseRank}>
            <Text variant="labelMedium" style={styles.exerciseRankText}>{rank}</Text>
        </View>
        <View style={styles.exerciseDetails}>
            <View style={styles.exerciseTitleRow}>
                <Text variant="labelLarge" style={styles.exerciseTitle} numberOfLines={1}>{exercise.title}</Text>
                <Text variant="labelMedium" style={styles.exerciseVolume}>{formatCompactNumber(exercise.volume)}</Text>
            </View>
            <AnimatedProgressBar ratio={ratio} color={rank === 1 ? palette.accent : palette.primary}/>
        </View>
    </View>
)

interface ActiveWorkoutDraftPanelProps {
    draft: ActiveWorkoutDraft
    isDiscarding: boolean
    onResume: () => void
    onDiscard: () => void
}

const ActiveWorkoutDraftPanel = ({
    draft,
    isDiscarding,
    onResume,
    onDiscard
}: ActiveWorkoutDraftPanelProps) => (
    <Card mode="contained" style={styles.activeDraftCard}>
        <Card.Content style={styles.activeDraftContent}>
            <View style={styles.panelHeader}>
                <View style={styles.activeDraftText}>
                    <Text variant="labelLarge" style={styles.activeDraftEyebrow}>Active workout</Text>
                    <Text variant="titleLarge" style={styles.activeDraftTitle}>{draft.workoutTitle ?? 'Workout in progress'}</Text>
                    <Text variant="bodySmall" style={styles.activeDraftMeta}>{formatDraftStartedAt(draft.startedAt)}</Text>
                </View>
                <Icon source="progress-clock" size={26} color={palette.primary}/>
            </View>
            <View style={styles.activeDraftActions}>
                <Button
                    mode="outlined"
                    icon="delete-outline"
                    loading={isDiscarding}
                    disabled={isDiscarding}
                    onPress={onDiscard}
                >
                    Discard
                </Button>
                <Button mode="contained" icon="play" onPress={onResume}>
                    Resume
                </Button>
            </View>
        </Card.Content>
    </Card>
)

export default function TabOneScreen() {
    const { data: workouts = [], isLoading, isError } = useGetWorkouts()
    const { data: stats, isLoading: isStatsLoading, isError: isStatsError } = useGetWorkoutStats()
    const { data: activeDraft } = useGetActiveWorkoutDraft()
    const deleteActiveDraft = useDeleteActiveWorkoutDraft()
    const { hydrateSession } = useWorkoutProgressStore()
    const router = useRouter()

    const recentWorkouts = useMemo(() => {
        return [...workouts]
            .sort((a, b) => {
                const aTime = (a.lastWorkout ?? a.createdAt).getTime()
                const bTime = (b.lastWorkout ?? b.createdAt).getTime()

                return bTime - aTime
            })
            .slice(0, 4)
    }, [workouts])

    if (isLoading || isStatsLoading) {
        return <LoadingState title="Loading dashboard"/>
    }

    if (isError || isStatsError) {
        return (
            <StateView
                title="Could not load dashboard"
                description="The local workout database did not respond. Restart the app and try again."
                icon="alert-circle-outline"
            />
        )
    }

    const resumeActiveDraft = () => {
        if (!activeDraft) return

        hydrateSession(activeDraft)
        router.navigate('/(workouts)/current-workout-main')
    }

    const discardActiveDraft = () => {
        Alert.alert(
            'Discard saved workout?',
            'Entered sets and notes in this draft will be lost.',
            [
                { text: 'Keep', style: 'cancel' },
                {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteActiveDraft.mutateAsync()
                        } catch {
                            Alert.alert('Could not discard workout', 'Please try again.')
                        }
                    }
                }
            ]
        )
    }

    return (
        <AppScreen contentStyle={styles.screenContent}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ScreenHeader
                    eyebrow="Workout tracker"
                    title="Work It"
                    description="Plan sessions, log sets, and keep your recent progress close at hand."
                    action={<AddWorkoutButton compact/>}
                />

                {activeDraft ? (
                    <AnimatedReveal delay={40}>
                        <ActiveWorkoutDraftPanel
                            draft={activeDraft}
                            isDiscarding={deleteActiveDraft.isPending}
                            onResume={resumeActiveDraft}
                            onDiscard={discardActiveDraft}
                        />
                    </AnimatedReveal>
                ) : null}

                <AnimatedReveal>
                    <MomentumPanel
                        currentStreakDays={stats?.currentStreakDays ?? 0}
                        longestStreakDays={stats?.longestStreakDays ?? 0}
                        thisWeekWorkouts={stats?.thisWeekWorkouts ?? 0}
                        sevenDayVolumeChangePercent={stats?.sevenDayVolumeChangePercent ?? 0}
                        averageDurationSeconds={stats?.averageDurationSeconds ?? 0}
                        bestSessionTitle={stats?.bestSession?.workoutTitle}
                        bestSessionVolume={stats?.bestSession?.volume}
                    />
                </AnimatedReveal>

                <View style={styles.section}>
                    <SectionHeader title="Training snapshot"/>
                    <View style={styles.statsGrid}>
                        <MetricTile
                            label="Workouts"
                            value={stats?.completedWorkouts ?? 0}
                            icon="calendar-check-outline"
                            color={palette.primary}
                            delay={60}
                            note={`${stats?.thisMonthWorkouts ?? 0} this month`}
                        />
                        <MetricTile
                            label="Logged sets"
                            value={stats?.loggedSets ?? 0}
                            icon="format-list-checks"
                            color={palette.accent}
                            delay={120}
                            note={`${stats?.loggedExercises ?? 0} exercises`}
                        />
                        <MetricTile
                            label="Volume"
                            value={formatCompactNumber(stats?.totalVolume ?? 0)}
                            icon="weight-kilogram"
                            color="#365E73"
                            delay={180}
                            note={`${formatCompactNumber(stats?.averageSessionVolume ?? 0)} avg`}
                        />
                        <MetricTile
                            label="Heaviest"
                            value={formatCompactNumber(stats?.heaviestWeight ?? 0)}
                            icon="trophy-outline"
                            color={palette.warning}
                            delay={240}
                            note={`Best score ${formatCompactNumber(stats?.bestSetScore ?? 0)}`}
                        />
                    </View>
                </View>

                <View style={styles.analyticsGrid}>
                    <AnimatedReveal delay={90} style={styles.analyticsItem}>
                        <DailyTrendChart data={stats?.dailyVolumeTrend ?? []}/>
                    </AnimatedReveal>
                    <AnimatedReveal delay={160} style={styles.analyticsItem}>
                        <TopExercisesPanel exercises={stats?.topExercises ?? []}/>
                    </AnimatedReveal>
                </View>

                <View style={styles.section}>
                    <SectionHeader title="Recent workouts"/>
                    {recentWorkouts.length > 0 ? (
                        <FlatList
                            data={recentWorkouts}
                            scrollEnabled={false}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }: { item: Workout }) => (
                                <Card
                                    mode="contained"
                                    style={styles.workoutCard}
                                    onPress={() => router.navigate({
                                        pathname: '/(tabs)/workouts',
                                        params: { targetWorkoutId: item.id.toString() }
                                    })}
                                >
                                    <List.Item
                                        title={item.title}
                                        description={formatWorkoutDate(item.lastWorkout)}
                                        titleStyle={styles.workoutTitle}
                                        descriptionStyle={styles.workoutDescription}
                                        left={(props) => <List.Icon {...props} icon="dumbbell" color={palette.primary}/>}
                                        right={(props) => <List.Icon {...props} icon="chevron-right"/>}
                                    />
                                </Card>
                            )}
                            contentContainerStyle={styles.recentList}
                        />
                    ) : (
                        <Card mode="contained" style={styles.emptyCard}>
                            <Card.Content style={styles.emptyContent}>
                                <Text variant="titleMedium" style={styles.workoutTitle}>No workouts yet</Text>
                                <Text variant="bodyMedium" style={styles.workoutDescription}>Create a workout to start building a repeatable training routine.</Text>
                            </Card.Content>
                        </Card>
                    )}
                </View>

                <View style={styles.actionRow}>
                    <Button
                        mode="contained-tonal"
                        icon="history"
                        style={styles.actionButton}
                        onPress={() => router.navigate('/(workouts)/history')}
                    >
                        History
                    </Button>
                    <Button
                        mode="contained-tonal"
                        icon="arrow-right"
                        style={styles.actionButton}
                        onPress={() => router.navigate('/(tabs)/workouts')}
                    >
                        Workouts
                    </Button>
                </View>
            </ScrollView>
        </AppScreen>
    )
}

const styles = StyleSheet.create({
    screenContent: {
        paddingHorizontal: 0,
        paddingVertical: 0
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 18,
        gap: 20,
        flexGrow: 1
    },
    section: {
        gap: 12
    },
    activeDraftCard: {
        backgroundColor: palette.surface
    },
    activeDraftContent: {
        gap: 16
    },
    activeDraftText: {
        flex: 1,
        gap: 4
    },
    activeDraftEyebrow: {
        color: palette.primary,
        textTransform: 'uppercase'
    },
    activeDraftTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    activeDraftMeta: {
        color: palette.muted
    },
    activeDraftActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        gap: 10
    },
    heroCard: {
        overflow: 'hidden',
        backgroundColor: palette.ink
    },
    heroContent: {
        gap: 18
    },
    heroTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 14
    },
    heroEyebrow: {
        color: '#A7F3D0',
        textTransform: 'uppercase'
    },
    heroNumber: {
        color: '#FFFFFF',
        fontWeight: '800',
        lineHeight: 54
    },
    heroTitle: {
        color: '#D8F3EA',
        fontWeight: '700'
    },
    deltaBadge: {
        minWidth: 82,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: '#FFFFFF'
    },
    deltaText: {
        fontWeight: '800'
    },
    heroStats: {
        flexDirection: 'row',
        gap: 10
    },
    heroStatItem: {
        flex: 1,
        minHeight: 66,
        justifyContent: 'center',
        gap: 2,
        padding: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
    },
    heroStatValue: {
        color: '#FFFFFF',
        fontWeight: '800'
    },
    heroStatLabel: {
        color: '#CFE9E4'
    },
    heroProgress: {
        gap: 8
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12
    },
    heroMuted: {
        color: '#D8F3EA'
    },
    bestSessionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingTop: 2
    },
    bestSessionText: {
        flex: 1,
        color: '#FFFFFF',
        lineHeight: 18
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12
    },
    metricTile: {
        flexBasis: '47%',
        flexGrow: 1
    },
    metricCard: {
        backgroundColor: palette.surface
    },
    metricContent: {
        minHeight: 132,
        gap: 7
    },
    metricIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center'
    },
    metricValue: {
        color: palette.ink,
        fontWeight: '800'
    },
    metricLabel: {
        color: palette.muted
    },
    metricNote: {
        color: palette.primaryDark,
        fontWeight: '700'
    },
    analyticsGrid: {
        gap: 12
    },
    analyticsItem: {
        width: '100%'
    },
    panelCard: {
        backgroundColor: palette.surface
    },
    chartContent: {
        gap: 18
    },
    topExercisesContent: {
        gap: 14
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12
    },
    panelTitle: {
        color: palette.ink,
        fontWeight: '800'
    },
    panelSubtle: {
        color: palette.muted
    },
    barChart: {
        height: 144,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 8
    },
    barItem: {
        flex: 1,
        alignItems: 'center',
        gap: 8
    },
    barTrack: {
        width: '100%',
        height: 112,
        justifyContent: 'flex-end',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: palette.surfaceAlt
    },
    barFill: {
        width: '100%',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    },
    barLabel: {
        color: palette.muted
    },
    progressTrack: {
        height: 8,
        overflow: 'hidden',
        borderRadius: 4,
        backgroundColor: 'rgba(104, 113, 109, 0.18)'
    },
    progressFill: {
        width: '100%',
        height: 8,
        borderRadius: 4
    },
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    exerciseRank: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.surfaceAlt
    },
    exerciseRankText: {
        color: palette.primaryDark,
        fontWeight: '800'
    },
    exerciseDetails: {
        flex: 1,
        gap: 7
    },
    exerciseTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
    },
    exerciseTitle: {
        flex: 1,
        color: palette.ink,
        fontWeight: '800'
    },
    exerciseVolume: {
        color: palette.muted,
        fontWeight: '700'
    },
    emptyAnalytics: {
        minHeight: 74,
        justifyContent: 'center',
        padding: 14,
        borderRadius: 8,
        backgroundColor: palette.surfaceAlt
    },
    emptyAnalyticsText: {
        color: palette.muted
    },
    recentList: {
        gap: 10
    },
    actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12
    },
    actionButton: {
        flexGrow: 1
    },
    workoutCard: {
        backgroundColor: palette.surface
    },
    workoutTitle: {
        color: palette.ink,
        fontWeight: '700'
    },
    workoutDescription: {
        color: palette.muted
    },
    emptyCard: {
        backgroundColor: palette.surfaceAlt
    },
    emptyContent: {
        gap: 4
    }
})
