import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useActiveWorkoutDraftService } from '@/database/services/useActiveWorkoutDraftService'
import { SaveActiveWorkoutDraftInput } from '@/store/types'

export const activeWorkoutDraftQueryKey = ['active-workout-draft'] as const

export const useGetActiveWorkoutDraft = () => {
    const { getActiveWorkoutDraft } = useActiveWorkoutDraftService()

    return useQuery({
        queryKey: activeWorkoutDraftQueryKey,
        queryFn: getActiveWorkoutDraft
    })
}

export const useSaveActiveWorkoutDraft = () => {
    const { saveActiveWorkoutDraft } = useActiveWorkoutDraftService()
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['save-active-workout-draft'],
        mutationFn: (draft: SaveActiveWorkoutDraftInput) => saveActiveWorkoutDraft(draft),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: activeWorkoutDraftQueryKey })
        }
    })
}

export const useDeleteActiveWorkoutDraft = () => {
    const { deleteActiveWorkoutDraft } = useActiveWorkoutDraftService()
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['delete-active-workout-draft'],
        mutationFn: deleteActiveWorkoutDraft,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: activeWorkoutDraftQueryKey })
        }
    })
}
