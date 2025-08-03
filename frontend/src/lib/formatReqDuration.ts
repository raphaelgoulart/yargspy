export const formatReqDuration = (ms: number): string => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`)
