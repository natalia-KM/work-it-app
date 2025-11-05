import { StyleSheet } from 'react-native'
import { View } from '@/components/Themed'
import { Icon, Text } from 'react-native-paper'
import { ReactNode } from 'react'

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
            <Icon source="sleep" size={64}/>
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
        gap: 15
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },
    title: {
        maxWidth: '90%',
        textAlign: 'center'
    },
    subtitle: {
        maxWidth: '80%',
        textAlign: 'center'
    }
})