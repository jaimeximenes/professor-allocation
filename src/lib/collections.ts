import type { ID } from "@/types/entities";

export function indexById<T extends { id: ID }>(items: T[]): Map<ID, T> {
  return new Map(items.map((item) => [item.id, item]));
}

export function groupBy<T>(
  items: T[],
  getKey: (item: T) => ID | null | undefined,
): Map<ID, T[]> {
  const groups = new Map<ID, T[]>();

  for (const item of items) {
    const key = getKey(item);

    if (key) {
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
  }

  return groups;
}
