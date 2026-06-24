import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}
