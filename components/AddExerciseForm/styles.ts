import { StyleSheet } from 'react-native'
import { palette } from '@/constants/theme'

export const styles = StyleSheet.create({
    container: {
        height: '100%',
        gap: 20
    },
    content: {
        flexGrow: 1,
        gap: 20
    },
    submitButton: {
        marginBottom: 10
    },
    submitContent: {
        minHeight: 50
    },
    surface: {
        backgroundColor: palette.surface
    }
});
