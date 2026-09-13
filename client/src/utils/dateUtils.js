/**
 * Normalizes UTC server date strings so browsers parse them in the user's exact local timezone
 */
export function parseServerDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;
  let str = String(dateInput).trim();
  if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(str)) {
    str += 'Z';
  } else if (!str.includes('T') && str.includes(' ')) {
    str = str.replace(' ', 'T') + 'Z';
  }
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Returns exact formatted date and timing (e.g. "Sep 13, 2026 at 12:48 PM")
 */
export function formatExactDateTime(dateInput, includeSeconds = false) {
  const date = parseServerDate(dateInput);
  if (!date) return '—';

  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true
  });

  return `${datePart} at ${timePart}`;
}

/**
 * Returns exact date & timing combined with live relative status
 * e.g. "Sep 13, 2026 at 12:48 PM (Just now)" or "Sep 13, 2026 at 11:30 AM (1h ago)"
 */
export function formatExactWithRelative(dateInput) {
  const date = parseServerDate(dateInput);
  if (!date) return 'Just now';

  const exact = formatExactDateTime(date);
  const relative = formatRelativeTime(date);

  if (relative === 'Just now') {
    return `${exact} (Just now)`;
  }
  return `${exact} (${relative})`;
}

/**
 * Relative time calculation with correct UTC offset normalization
 */
export function formatRelativeTime(dateInput) {
  const date = parseServerDate(dateInput);
  if (!date) return 'Just now';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 10000 && diffMs >= -5000) return 'Just now';
  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
