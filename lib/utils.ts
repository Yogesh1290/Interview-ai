import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatInterviewType(type: string): string {
  switch (type) {
    case "technical":
      return "Technical"
    case "behavioral":
      return "Behavioral"
    case "mixed":
      return "Mixed"
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}
