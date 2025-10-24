import { MuscleTag } from '@/database/entities'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useTagsService } from '@/database/services/useTagsService'

export const useGetMuscleTags = (): UseQueryResult<MuscleTag[], Error> => {
    const { getMuscleTags } = useTagsService()

    return useQuery<MuscleTag[], Error>({
        queryKey: ['muscleTags'],
        queryFn: () => getMuscleTags()
    })
}