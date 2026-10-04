/** "08:00:00" ou "08:00" -> "08:00" */
export function formatHour(value: string): string {
  return value.slice(0, 5);
}

/** "08:00" -> "08:00:00", o formato de java.time.LocalTime usado pelo backend. */
export function toLocalTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export function toMinutes(value: string): number {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);

  return hours * 60 + minutes;
}

export function durationInMinutes(start: string, end: string): number {
  return Math.max(0, toMinutes(end) - toMinutes(start));
}

/**
 * Dois intervalos se sobrepõem quando um começa antes do outro terminar.
 * Intervalos encostados (08:00–10:00 e 10:00–12:00) não se sobrepõem.
 */
export function rangesOverlap(
  first: { startHour: string; endHour: string },
  second: { startHour: string; endHour: string },
): boolean {
  return (
    toMinutes(first.startHour) < toMinutes(second.endHour) &&
    toMinutes(second.startHour) < toMinutes(first.endHour)
  );
}

/** 120 -> "2h", 100 -> "1h40", 50 -> "50min" */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}min`;
  }

  return minutes === 0
    ? `${hours}h`
    : `${hours}h${String(minutes).padStart(2, "0")}`;
}
