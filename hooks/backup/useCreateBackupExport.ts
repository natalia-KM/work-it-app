import { useMutation } from '@tanstack/react-query'
import { BackupExportPayload } from '@/database/backupExport'
import { SavedBackupExport, writeBackupExportFile } from '@/database/backupExportFile'
import { useBackupExportService } from '@/database/services/useBackupExportService'

export interface CreateBackupExportResult extends SavedBackupExport {
    payload: BackupExportPayload
}

export const useCreateBackupExport = () => {
    const { createBackupExport } = useBackupExportService()

    return useMutation<CreateBackupExportResult, Error>({
        mutationKey: ['backup-export'],
        mutationFn: async () => {
            const payload = await createBackupExport()
            const file = await writeBackupExportFile(payload)

            return {
                ...file,
                payload
            }
        }
    })
}
