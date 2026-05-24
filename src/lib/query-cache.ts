export const STALE_TIME_MS = 1000 * 60 * 60 * 12;
export const GC_TIME_MS = 1000 * 60 * 60 * 24;

/** Cached pages refetch in the background once data is older than 12 hours. */
export const staticPageQueryOptions = {
  staleTime: STALE_TIME_MS,
  gcTime: GC_TIME_MS,
  refetchOnMount: true,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
} as const;

/** Shorter-lived reads for admin views that change frequently. */
export const adminLiveQueryOptions = {
  staleTime: 0,
  gcTime: GC_TIME_MS,
  refetchOnMount: true,
  refetchOnReconnect: true,
  refetchOnWindowFocus: false,
} as const;

export function projectQueryKey(identifier: string) {
  return ["project", identifier] as const;
}

export function isOrgAdmin(role?: string | null) {
  return role?.toLowerCase() === "admin";
}

export function queryOptionsForRole(role?: string | null) {
  return isOrgAdmin(role) ? adminLiveQueryOptions : staticPageQueryOptions;
}
