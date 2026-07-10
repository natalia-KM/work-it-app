import { useInfiniteQuery } from '@tanstack/react-query'
import { useLogService } from '@/database/services/useLogService'

export type ExerciseHistoryScope = 'workout' | 'all'

const INITIAL_PAGE_SIZE = 5
const FOLLOW_UP_PAGE_SIZE = 20

interface ExerciseHistoryPageParam {
    offset: number
    limit: number
}

interface UseGetExerciseHistoryProps {
    exerciseId?: number
    workoutId?: number
    scope: ExerciseHistoryScope
}

export const exerciseHistoryQueryKey = ({
    exerciseId,
    workoutId,
    scope
}: UseGetExerciseHistoryProps) => [
    'exercise-history',
    exerciseId,
    scope === 'workout' ? workoutId : 'all'
]

export const useGetExerciseHistory = ({
    exerciseId,
    workoutId,
    scope
}: UseGetExerciseHistoryProps) => {
    const { getExerciseHistory } = useLogService()

    return useInfiniteQuery({
        queryKey: exerciseHistoryQueryKey({ exerciseId, workoutId, scope }),
        initialPageParam: {
            offset: 0,
            limit: INITIAL_PAGE_SIZE
        } satisfies ExerciseHistoryPageParam,
        queryFn: ({ pageParam }) => {
            if (!exerciseId) return []

            return getExerciseHistory({
                exerciseId,
                workoutId: scope === 'workout' ? workoutId : undefined,
                limit: pageParam.limit,
                offset: pageParam.offset
            })
        },
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            if (lastPage.length < lastPageParam.limit) return undefined

            return {
                offset: lastPageParam.offset + lastPage.length,
                limit: FOLLOW_UP_PAGE_SIZE
            } satisfies ExerciseHistoryPageParam
        },
        enabled: typeof exerciseId === 'number'
            && Number.isFinite(exerciseId)
            && (scope === 'all' || (typeof workoutId === 'number' && Number.isFinite(workoutId))),
        retry: false
    })
}
