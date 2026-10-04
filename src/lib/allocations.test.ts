import { describe, expect, it } from "vitest";
import seed from "../../db/seed.json";
import type { Allocation, DayOfWeek } from "@/types/entities";
import {
  buildAllocationViews,
  compareAllocations,
  findConflicts,
  totalMinutes,
} from "./allocations";
import { indexById } from "./collections";

function allocation(
  id: string,
  dayOfWeek: DayOfWeek,
  startHour: string,
  endHour: string,
  professorId = "1",
): Allocation {
  return { id, dayOfWeek, startHour, endHour, professorId, courseId: "1" };
}

// Mesmos cenários do AllocationServiceTest do backend.
describe("findConflicts", () => {
  const existing = [allocation("1", "MONDAY", "08:00:00", "10:00:00")];

  it("acusa conflito quando os horários se sobrepõem no mesmo dia", () => {
    const candidate = {
      professorId: "1",
      dayOfWeek: "MONDAY",
      startHour: "09:00",
      endHour: "11:00",
    } as const;

    expect(findConflicts(candidate, existing)).toHaveLength(1);
  });

  it("permite aulas encostadas no mesmo dia (10:00 termina, 10:00 começa)", () => {
    const candidate = {
      professorId: "1",
      dayOfWeek: "MONDAY",
      startHour: "10:00",
      endHour: "12:00",
    } as const;

    expect(findConflicts(candidate, existing)).toHaveLength(0);
  });

  it("permite o mesmo horário em outro dia", () => {
    const candidate = {
      professorId: "1",
      dayOfWeek: "TUESDAY",
      startHour: "08:00",
      endHour: "10:00",
    } as const;

    expect(findConflicts(candidate, existing)).toHaveLength(0);
  });

  it("permite o mesmo horário para outro professor", () => {
    const candidate = {
      professorId: "2",
      dayOfWeek: "MONDAY",
      startHour: "08:00",
      endHour: "10:00",
    } as const;

    expect(findConflicts(candidate, existing)).toHaveLength(0);
  });

  it("ignora a própria alocação ao editar", () => {
    const candidate = {
      id: "1",
      professorId: "1",
      dayOfWeek: "MONDAY",
      startHour: "08:00",
      endHour: "10:00",
    } as const;

    expect(findConflicts(candidate, existing)).toHaveLength(0);
  });

  it("acusa conflito quando uma aula contém a outra", () => {
    const candidate = {
      professorId: "1",
      dayOfWeek: "MONDAY",
      startHour: "07:00",
      endHour: "12:00",
    } as const;

    expect(findConflicts(candidate, existing)).toHaveLength(1);
  });
});

describe("compareAllocations e totalMinutes", () => {
  it("ordena por dia da semana e depois por horário de início", () => {
    const items = [
      allocation("a", "TUESDAY", "08:00:00", "10:00:00"),
      allocation("b", "MONDAY", "14:00:00", "16:00:00"),
      allocation("c", "MONDAY", "08:00:00", "10:00:00"),
    ];

    expect([...items].sort(compareAllocations).map((item) => item.id)).toEqual([
      "c",
      "b",
      "a",
    ]);
  });

  it("soma a carga horária em minutos", () => {
    const items = [
      allocation("a", "MONDAY", "08:00:00", "10:00:00"),
      allocation("b", "MONDAY", "19:00:00", "20:40:00"),
    ];

    expect(totalMinutes(items)).toBe(220);
  });
});

describe("dados de exemplo (db/seed.json)", () => {
  const allocations = seed.allocations as Allocation[];

  it("não têm conflitos de horário", () => {
    const views = buildAllocationViews(allocations, {
      professorsById: indexById(seed.professors),
      coursesById: indexById(seed.courses),
      departmentsById: indexById(seed.departments),
    });

    expect(views.filter((view) => view.hasConflict)).toEqual([]);
  });

  it("referenciam professores, cursos e departamentos existentes", () => {
    const professorIds = new Set(
      seed.professors.map((professor) => professor.id),
    );
    const courseIds = new Set(seed.courses.map((course) => course.id));
    const departmentIds = new Set(
      seed.departments.map((department) => department.id),
    );

    for (const item of allocations) {
      expect(professorIds.has(item.professorId ?? "")).toBe(true);
      expect(courseIds.has(item.courseId ?? "")).toBe(true);
    }

    for (const professor of seed.professors) {
      expect(departmentIds.has(professor.departmentId)).toBe(true);
    }
  });
});
