import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname)
        }
    },
    test: {
        environment: 'node',
        globals: true,
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            exclude: [
                'assets/**',
                'drizzle/**',
                'node_modules/**'
            ]
        }
    }
})
