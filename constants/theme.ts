import { DefaultTheme as NavigationDefaultTheme, Theme } from '@react-navigation/native'
import { MD3LightTheme, MD3Theme } from 'react-native-paper'

export const palette = {
    background: '#F7F5F0',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF6F4',
    primary: '#0F766E',
    primaryDark: '#115E59',
    accent: '#F9735B',
    accentSoft: '#FFE8E2',
    ink: '#17211F',
    muted: '#68716D',
    line: '#DDE4DE',
    success: '#15803D',
    warning: '#B45309',
    error: '#B42318'
}

export const appTheme: MD3Theme = {
    ...MD3LightTheme,
    roundness: 8,
    colors: {
        ...MD3LightTheme.colors,
        primary: palette.primary,
        onPrimary: '#FFFFFF',
        primaryContainer: '#CFE9E4',
        onPrimaryContainer: palette.primaryDark,
        secondary: palette.accent,
        onSecondary: '#FFFFFF',
        secondaryContainer: palette.accentSoft,
        onSecondaryContainer: '#7A2E1E',
        tertiary: '#365E73',
        tertiaryContainer: '#D5EAF4',
        background: palette.background,
        onBackground: palette.ink,
        surface: palette.surface,
        onSurface: palette.ink,
        surfaceVariant: '#EDF2EE',
        onSurfaceVariant: palette.muted,
        outline: '#9AA6A0',
        outlineVariant: palette.line,
        error: palette.error
    }
}

export const navigationTheme: Theme = {
    ...NavigationDefaultTheme,
    colors: {
        ...NavigationDefaultTheme.colors,
        primary: appTheme.colors.primary,
        background: appTheme.colors.background,
        card: appTheme.colors.surface,
        text: appTheme.colors.onSurface,
        border: appTheme.colors.outlineVariant,
        notification: appTheme.colors.secondary
    }
}
