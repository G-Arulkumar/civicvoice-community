export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function sortIssues(issues: import('@/types/issue').Issue[]): import('@/types/issue').Issue[] {
  return [...issues].sort((a, b) => {
    // Unsolved first
    if (a.status !== b.status) {
      return a.status === 'unsolved' ? -1 : 1;
    }
    // Higher report count first
    if (a.reportCount !== b.reportCount) {
      return b.reportCount - a.reportCount;
    }
    // More recent first
    return b.lastReported.getTime() - a.lastReported.getTime();
  });
}
