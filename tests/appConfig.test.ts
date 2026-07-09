import { describe, expect, it } from 'vitest'
import config from '../app.config'

describe('Expo app config', () => {
    it('keeps the app identity and custom scheme stable', () => {
        expect(config.expo?.name).toBe('work-it-app')
        expect(config.expo?.slug).toBe('work-it-app')
        expect(config.expo?.scheme).toBe('workitapp')
    })

    it('configures required native plugins for local data and images', () => {
        expect(config.expo?.plugins).toContain('expo-router')
        expect(config.expo?.plugins).toContainEqual([
            'expo-sqlite',
            {
                enableFTS: true,
                useSQLCipher: false
            }
        ])
        expect(config.expo?.plugins).toContainEqual([
            'expo-image-picker',
            {
                photosPermission: 'Allow Work It to choose exercise photos from your library.'
            }
        ])
    })
})

