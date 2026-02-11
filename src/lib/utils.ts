import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind classes safely.
 * This is used by all your Shadcn components (Button, Card, etc.)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}