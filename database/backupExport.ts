export const BACKUP_EXPORT_APP = 'work-it-app'
export const BACKUP_EXPORT_VERSION = 1

export interface BackupExportData {
    exercises: unknown[]
    muscleTags: unknown[]
    exerciseMuscleTags: unknown[]
    workouts: unknown[]
    workoutExercises: unknown[]
    workoutLogs: unknown[]
    workoutLogExercises: unknown[]
    activeWorkoutDraft: unknown | null
}

export interface BackupExportPayload {
    app: typeof BACKUP_EXPORT_APP
    version: typeof BACKUP_EXPORT_VERSION
    exportedAt: string
    data: BackupExportData
}

const padDatePart = (value: number) => value.toString().padStart(2, '0')

export const createBackupExportPayload = (
    data: BackupExportData,
    exportedAt: Date = new Date()
): BackupExportPayload => ({
    app: BACKUP_EXPORT_APP,
    version: BACKUP_EXPORT_VERSION,
    exportedAt: exportedAt.toISOString(),
    data
})

export const serializeBackupExport = (payload: BackupExportPayload) => {
    return JSON.stringify(payload, null, 2)
}

export const getBackupExportFilename = (exportedAt: string | Date) => {
    const date = exportedAt instanceof Date ? exportedAt : new Date(exportedAt)

    if (Number.isNaN(date.getTime())) {
        return 'work-it-backup.json'
    }

    const year = date.getUTCFullYear()
    const month = padDatePart(date.getUTCMonth() + 1)
    const day = padDatePart(date.getUTCDate())
    const hours = padDatePart(date.getUTCHours())
    const minutes = padDatePart(date.getUTCMinutes())

    return `work-it-backup-${year}${month}${day}-${hours}${minutes}.json`
}
