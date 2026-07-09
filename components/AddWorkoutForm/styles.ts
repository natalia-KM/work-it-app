import { StyleSheet } from 'react-native'
import { palette } from '@/constants/theme'

export const styles = StyleSheet.create({
    container: {
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
        gap: 4
    },
    title: {
        color: palette.ink,
        fontWeight: '800'
    },
    subtitle: {
        color: palette.muted
    },
    colorSwatch: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginTop: 4,
        borderWidth: 3,
        borderColor: palette.surface,
        elevation: 2
    },
    content: {
        flexGrow: 1,
        gap: 20
    },
    submitButton: {
        marginBottom: 10
    }
});
