import { Directory, File, Paths } from 'expo-file-system'
import {
    BackupExportPayload,
    getBackupExportFilename,
    serializeBackupExport
} from '@/database/backupExport'

const BACKUP_DIRECTORY_NAME = 'backups'

export interface SavedBackupExport {
    filename: string
    uri: string
    bytes: number
}

export const writeBackupExportFile = async (
    payload: BackupExportPayload
): Promise<SavedBackupExport> => {
    const directory = new Directory(Paths.document, BACKUP_DIRECTORY_NAME)
    const filename = getBackupExportFilename(payload.exportedAt)
    const file = new File(directory, filename)
    const contents = serializeBackupExport(payload)

    directory.create({ intermediates: true, idempotent: true })
    file.create({ overwrite: true })
    file.write(contents)

    return {
        filename,
        uri: file.uri,
        bytes: contents.length
    }
}
