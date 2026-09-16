import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isUnknownTrackText(val?: string | null): boolean {
  if (!val) return true;
  const lower = val.trim().toLowerCase();
  return (
    lower === "" ||
    lower === "unknown" ||
    lower === "unknow" ||
    lower === "unknown artist" ||
    lower === "unknown title" ||
    lower === "unknown track" ||
    lower === "bilinmiyor" ||
    lower === "undefined" ||
    lower === "null"
  );
}

export function cleanTrackText(val?: string | null): string {
  if (!val || isUnknownTrackText(val)) return "";
  return val.replace(/\s+/g, " ").trim();
}
