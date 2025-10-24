import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    list: {
        flex: 1,
        width: '80%',
    },
    itemWrapper: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        borderColor: 'black',
        borderWidth: 0.5,
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginBottom: 10
    },
    imageWrapper: {
      maxWidth: '40%'
    },
    image: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    contentWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
    },
});
