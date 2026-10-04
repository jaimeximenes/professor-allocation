import { DAYS_OF_WEEK, type DayOfWeek } from "@/types/entities";

export const DAY_LABELS: Record<DayOfWeek, { long: string; short: string }> = {
  MONDAY: { long: "Segunda-feira", short: "Seg" },
  TUESDAY: { long: "Terça-feira", short: "Ter" },
  WEDNESDAY: { long: "Quarta-feira", short: "Qua" },
  THURSDAY: { long: "Quinta-feira", short: "Qui" },
  FRIDAY: { long: "Sexta-feira", short: "Sex" },
  SATURDAY: { long: "Sábado", short: "Sáb" },
  SUNDAY: { long: "Domingo", short: "Dom" },
};

export function dayIndex(day: DayOfWeek): number {
  return DAYS_OF_WEEK.indexOf(day);
}

export function isDayOfWeek(value: unknown): value is DayOfWeek {
  return DAYS_OF_WEEK.includes(value as DayOfWeek);
}
