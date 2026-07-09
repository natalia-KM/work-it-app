import { describe, expect, it, vi } from 'vitest'
import { seedIfEmpty, seedRelationshipIfEmpty } from '@/database/seeds/useSeedDatabase'

const createDb = (existingRows: Record<string, unknown>[]) => {
    const values = vi.fn()

    return {
        values,
        db: {
            select: vi.fn(() => ({
                from: vi.fn(async () => existingRows)
            })),
            insert: vi.fn(() => ({
                values
            }))
        }
    }
}

describe('seed helpers', () => {
    it('inserts only missing seed rows by key', async () => {
        const { db, values } = createDb([{ title: 'Squat' }])

        await seedIfEmpty(db as never, {} as never, [
            { title: 'Squat', isCustom: false },
            { title: 'Bench Press', isCustom: false }
        ], 'title')

        expect(values).toHaveBeenCalledWith([{ title: 'Bench Press', isCustom: false }])
    })

    it('does not insert when every seed row exists', async () => {
        const { db } = createDb([{ title: 'Squat' }])

        await seedIfEmpty(db as never, {} as never, [
            { title: 'Squat', isCustom: false }
        ], 'title')

        expect(db.insert).not.toHaveBeenCalled()
    })

    it('seeds only missing relationship rows by composite key', async () => {
        const { db, values } = createDb([{ exerciseId: 1, tabId: 2 }])

        await seedRelationshipIfEmpty(db as never, {} as never, [
            { exerciseId: 1, tabId: 2 },
            { exerciseId: 1, tabId: 3 }
        ], (row) => `${row.exerciseId}_${row.tabId}`)

        expect(values).toHaveBeenCalledWith([{ exerciseId: 1, tabId: 3 }])
    })
})

