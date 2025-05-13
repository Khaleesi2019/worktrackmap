import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to locale string
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString();
}

// Format time to locale string
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Format relative time (e.g., "2 min ago", "5 hours ago")
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);
  
  if (diffSec < 60) {
    return 'now';
  } else if (diffMin < 60) {
    return `${diffMin} min ago`;
  } else if (diffHr < 24) {
    return `${diffHr} hr ago`;
  } else if (diffDays === 1) {
    return 'yesterday';
  } else {
    return formatDate(date);
  }
}

// Get status color based on status string
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'online':
    case 'present':
      return 'bg-green-500';
    case 'away':
      return 'bg-yellow-500';
    case 'offline':
    case 'absent':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
}

// Get text color based on status string
export function getStatusTextColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'online':
    case 'present':
      return 'text-green-600 dark:text-green-400';
    case 'away':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'offline':
    case 'absent':
      return 'text-gray-600 dark:text-gray-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

// Format a chat timestamp
export function formatChatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Check if two dates are on the same day
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Generate random pastel color
export function generatePastelColor(str: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate pastel color using hue
  const h = hash % 360;
  return `hsl(${h}, 70%, 80%)`;
}
