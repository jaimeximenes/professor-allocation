import type { ID } from "@/types/entities";

const COURSE_COLORS = [
  "blue",
  "green",
  "purple",
  "orange",
  "pink",
  "cyan",
  "teal",
  "red",
  "yellow",
] as const;

/** Cada curso recebe sempre a mesma cor (colorScheme do Chakra), calculada a partir do id. */
export function courseColor(courseId: ID | null | undefined): string {
  if (!courseId) {
    return "gray";
  }

  let hash = 0;
  for (const char of courseId) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return COURSE_COLORS[hash % COURSE_COLORS.length];
}
