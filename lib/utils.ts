import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a URL that bypasses CORS for RSS feeds
 */
export function proxyUrl(url: string): string {
  // List of possible CORS proxies
  const corsProxies = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/'
  ];
  
  // Use the first proxy by default
  const proxy = corsProxies[0];
  
  return `${proxy}${encodeURIComponent(url)}`;
} 