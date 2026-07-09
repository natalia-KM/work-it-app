import { StyleSheet, View } from 'react-native'
import { PropsWithChildren } from 'react'
import { Text } from 'react-native-paper'
import { palette } from '@/constants/theme'

export const Table = ({ children }: PropsWithChildren) => {
    return (
        <View style={styles.table}>
            {children}
        </View>
    )
}

interface TableRowProps {
    dense?: boolean
}

export const TableRow = ({ children, dense = false }: PropsWithChildren<TableRowProps>) => {
    return (
        <View style={styles.row}>
            {children}
        </View>
    )
}

export const TableRowItem = ({ children, dense = false }: PropsWithChildren<TableRowProps>) => {
    return (
        <View style={[styles.rowItem, dense && styles.denseRow]}>
            {children}
        </View>
    )
}

interface TableHeaderItemProps {
    title: string
}

export const TableHeaderItem = ({ title }: TableHeaderItemProps) => {
    return (
        <View style={styles.rowItem}>
            <Text variant={'titleMedium'} style={styles.headerTitle}>{title}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    table: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: 12,
        borderRadius: 8,
        backgroundColor: palette.surface,
        gap: 8
    },
    row: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        justifyContent: 'center',
        alignItems: 'center'
    },
    rowItem: {
        flex: 1,
        alignSelf: 'stretch',
        paddingHorizontal: 4,
        paddingVertical: 2,
        justifyContent: 'center'
    },
    headerTitle: {
        textAlign: 'center',
        color: palette.muted,
        fontWeight: '700'
    },
    denseRow: {
        flex: 0.5
    }
})
