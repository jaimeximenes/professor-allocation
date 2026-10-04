import { describe, expect, it } from "vitest";
import {
  durationInMinutes,
  formatDuration,
  formatHour,
  rangesOverlap,
  toLocalTime,
  toMinutes,
} from "./time";

describe("conversões de horário", () => {
  it("converte entre o formato do formulário e o LocalTime do backend", () => {
    expect(toLocalTime("08:30")).toBe("08:30:00");
    expect(toLocalTime("08:30:00")).toBe("08:30:00");
    expect(formatHour("08:30:00")).toBe("08:30");
  });

  it("calcula minutos e durações", () => {
    expect(toMinutes("19:40:00")).toBe(1180);
    expect(durationInMinutes("08:00", "09:40")).toBe(100);
    expect(formatDuration(120)).toBe("2h");
    expect(formatDuration(100)).toBe("1h40");
    expect(formatDuration(50)).toBe("50min");
  });

  it("detecta sobreposição de intervalos", () => {
    const morning = { startHour: "08:00:00", endHour: "10:00:00" };

    expect(
      rangesOverlap(morning, { startHour: "09:00", endHour: "11:00" }),
    ).toBe(true);
    expect(
      rangesOverlap(morning, { startHour: "10:00", endHour: "12:00" }),
    ).toBe(false);
    expect(
      rangesOverlap(morning, { startHour: "06:00", endHour: "08:00" }),
    ).toBe(false);
  });
});
