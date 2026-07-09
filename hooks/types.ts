import { UseQueryOptions } from '@tanstack/react-query';

export type ApiHookQueryProps<TData, TError = unknown> = Partial<
    Omit<
        UseQueryOptions<TData, TError, TData, any[]>,
        'queryKey' | 'queryFn'
    >
>;

export type ApiHookProps<TParams, TData, TError = Error> =
    TParams & Partial<UseQueryOptions<TData, TError>>;