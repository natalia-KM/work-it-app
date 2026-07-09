import { StyleSheet, View } from 'react-native'
import { Icon, Text } from 'react-native-paper'
import { ReactNode } from 'react'
import { palette } from '@/constants/theme'

export interface NoItemsFoundProps {
    title?: string
    description?: string
    ActionButton?: ReactNode
}

export const NoItemsFound = ({
    title,
    description,
    ActionButton
}: NoItemsFoundProps) => {
    return (
        <View style={styles.noItemsFoundContainer}>
            <View style={styles.iconWrap}>
                <Icon source="playlist-plus" size={42} color={palette.primary}/>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title} variant="titleLarge">{title ?? 'No items found'}</Text>
                <Text style={styles.subtitle}>{description ?? 'There’s nothing here yet. Start by adding a new item.'}</Text>
            </View>
            {ActionButton}
        </View>
    )
}

const styles = StyleSheet.create({
    noItemsFoundContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 25,
        gap: 16,
        backgroundColor: palette.background
    },
    iconWrap: {
        width: 86,
        height: 86,
        borderRadius: 43,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.surfaceAlt
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6
    },
    title: {
        maxWidth: '90%',
        textAlign: 'center',
        color: palette.ink,
        fontWeight: '800'
    },
    subtitle: {
        maxWidth: '80%',
        textAlign: 'center',
        color: palette.muted,
        lineHeight: 20
    }
})
