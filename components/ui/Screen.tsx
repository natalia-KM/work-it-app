import { PropsWithChildren, ReactNode } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { ActivityIndicator, Button, Card, Icon, Text } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { palette } from '@/constants/theme'

interface AppScreenProps extends PropsWithChildren {
    style?: StyleProp<ViewStyle>
    contentStyle?: StyleProp<ViewStyle>
}

export const AppScreen = ({ children, style, contentStyle }: AppScreenProps) => (
    <SafeAreaView style={[styles.screen, style]}>
        <View style={[styles.content, contentStyle]}>
            {children}
        </View>
    </SafeAreaView>
)

interface ScreenHeaderProps {
    eyebrow?: string
    title: string
    description?: string
    action?: ReactNode
}

export const ScreenHeader = ({ eyebrow, title, description, action }: ScreenHeaderProps) => (
    <View style={styles.header}>
        <View style={styles.headerText}>
            {eyebrow ? <Text variant="labelLarge" style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text variant="headlineMedium" style={styles.title}>{title}</Text>
            {description ? <Text variant="bodyMedium" style={styles.description}>{description}</Text> : null}
        </View>
        {action ? <View style={styles.headerAction}>{action}</View> : null}
    </View>
)

interface SectionHeaderProps {
    title: string
    action?: ReactNode
}

export const SectionHeader = ({ title, action }: SectionHeaderProps) => (
    <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
        {action}
    </View>
)

interface MetricCardProps {
    label: string
    value: string | number
    icon: string
}

export const MetricCard = ({ label, value, icon }: MetricCardProps) => (
    <Card mode="contained" style={styles.metricCard}>
        <Card.Content style={styles.metricContent}>
            <View style={styles.metricIcon}>
                <Icon source={icon} size={20} color={palette.primary}/>
            </View>
            <Text variant="headlineSmall" style={styles.metricValue}>{value}</Text>
            <Text variant="labelMedium" style={styles.metricLabel}>{label}</Text>
        </Card.Content>
    </Card>
)

interface StateViewProps {
    title: string
    description?: string
    icon?: string
    actionLabel?: string
    onAction?: () => void
}

export const LoadingState = ({ title = 'Loading' }: Partial<StateViewProps>) => (
    <View style={styles.state}>
        <ActivityIndicator/>
        <Text variant="bodyMedium" style={styles.description}>{title}</Text>
    </View>
)

export const StateView = ({
    title,
    description,
    icon = 'alert-circle-outline',
    actionLabel,
    onAction
}: StateViewProps) => (
    <View style={styles.state}>
        <View style={styles.stateIcon}>
            <Icon source={icon} size={34} color={palette.primary}/>
        </View>
        <Text variant="titleMedium" style={styles.stateTitle}>{title}</Text>
        {description ? <Text variant="bodyMedium" style={styles.stateDescription}>{description}</Text> : null}
        {actionLabel && onAction ? (
            <Button mode="contained" onPress={onAction}>
                {actionLabel}
            </Button>
        ) : null}
    </View>
)

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: palette.background
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 18,
        gap: 20
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16
    },
    headerText: {
        flex: 1,
        gap: 5
    },
    headerAction: {
        paddingTop: 3
    },
    eyebrow: {
        color: palette.primary,
        textTransform: 'uppercase'
    },
    title: {
        color: palette.ink,
        fontWeight: '800'
    },
    description: {
        color: palette.muted,
        lineHeight: 20
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    sectionTitle: {
        color: palette.ink,
        fontWeight: '700'
    },
    metricCard: {
        flexBasis: '47%',
        flexGrow: 1,
        backgroundColor: palette.surface
    },
    metricContent: {
        minHeight: 116,
        gap: 8
    },
    metricIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.surfaceAlt
    },
    metricValue: {
        color: palette.ink,
        fontWeight: '800'
    },
    metricLabel: {
        color: palette.muted
    },
    state: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
        gap: 12,
        backgroundColor: palette.background
    },
    stateIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.surfaceAlt
    },
    stateTitle: {
        color: palette.ink,
        fontWeight: '700',
        textAlign: 'center'
    },
    stateDescription: {
        maxWidth: 300,
        color: palette.muted,
        lineHeight: 20,
        textAlign: 'center'
    }
})
