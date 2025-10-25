import { StyleSheet } from 'react-native';
// box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
export default StyleSheet.create({
    list: {
        flex: 1,
        width: '85%'
    },
    container: {
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        paddingTop: 2
    },
    itemWrapper: {
        width: '98%',
        alignSelf: 'center',
        marginBottom: 12,
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.16)',
        paddingHorizontal: 4,
        paddingVertical: 0
    },
    imageWrapper: {
        maxWidth: '40%'
    },
    image: {
        width: 64,
        height: 64,
        marginRight: 8
    },
    contentWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    subtitle: {
        fontSize: 12,
        color: '#666'
    }
});
