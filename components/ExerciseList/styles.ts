import { StyleSheet } from 'react-native';
import { palette } from '@/constants/theme'

export default StyleSheet.create({
    searchBar: {
        width: '100%',
        marginBottom: 14,
        backgroundColor: palette.surface
    },
    searchInput: {
        minHeight: 0
    },
    list: {
        flex: 1,
        width: '100%'
    },
    container: {
        paddingBottom: 24,
        gap: 12
    },
    itemContents: {
        alignItems: 'center',
        minHeight: 84
    },
    itemWrapper: {
        backgroundColor: palette.surface,
        borderRadius: 8
    },
    imageWrapper: {
        maxWidth: '40%'
    },
    image: {
        width: 64,
        height: 64,
        marginRight: 10,
        borderRadius: 8,
        backgroundColor: palette.surfaceAlt
    },
    contentWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        color: palette.ink
    },
    subtitle: {
        fontSize: 12,
        color: palette.muted
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        paddingTop: 4
    },
    chip: {
        backgroundColor: palette.surfaceAlt
    },
    chipText: {
        color: palette.primaryDark,
        fontSize: 11
    }
});
