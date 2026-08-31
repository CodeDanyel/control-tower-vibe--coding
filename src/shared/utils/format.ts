export function formatDuration(totalMinutes: number) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

export function formatVariance(minutes: number) {
  if (minutes === 0) return 'On track';
  return `${minutes > 0 ? '+' : '−'}${formatDuration(Math.abs(minutes))}`;
}

export function minutesSince(iso: string | null, now = Date.now()) {
  if (!iso) return 0;
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

export function freshness(iso: string | null) {
  if (!iso) return 'Unavailable';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 12) return 'Updated just now';
  if (seconds < 60) return `Updated ${seconds} sec ago`;
  return `Updated ${formatDuration(Math.floor(seconds / 60))} ago`;
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }).format(new Date(iso));
}
