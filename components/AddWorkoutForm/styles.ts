import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
    container: {
        gap: 20
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    content: {
        flexGrow: 1,
        gap: 20
    },
    submitButton: {
        marginBottom: 10
    }
});
