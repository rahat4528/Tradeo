import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(isoString: string, timezone: string = 'UTC'): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(isoString));
  } catch (e) {
    return new Date(isoString).toLocaleString();
  }
}
