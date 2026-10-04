import type {
  Allocation,
  Course,
  Department,
  ID,
  Professor,
} from "@/types/entities";
import { dayIndex } from "./days";
import { durationInMinutes, rangesOverlap, toMinutes } from "./time";

/** Alocação com as entidades relacionadas resolvidas, pronta para exibição. */
export type AllocationView = Allocation & {
  professor?: Professor;
  course?: Course;
  department?: Department;
  hasConflict: boolean;
};

export type AllocationCandidate = Pick<
  Allocation,
  "dayOfWeek" | "startHour" | "endHour" | "professorId"
> & { id?: ID };

/**
 * Regra de negócio: um professor não pode ter duas alocações no mesmo dia com
 * horários sobrepostos. Retorna as alocações que conflitam com a candidata
 * (ignorando ela mesma, no caso de edição).
 */
export function findConflicts(
  candidate: AllocationCandidate,
  allocations: Allocation[],
): Allocation[] {
  if (!candidate.professorId) {
    return [];
  }

  return allocations.filter(
    (other) =>
      other.id !== candidate.id &&
      other.professorId === candidate.professorId &&
      other.dayOfWeek === candidate.dayOfWeek &&
      rangesOverlap(candidate, other),
  );
}

/** Ordena por dia da semana e, dentro do dia, pelo horário de início. */
export function compareAllocations(
  first: Allocation,
  second: Allocation,
): number {
  return (
    dayIndex(first.dayOfWeek) - dayIndex(second.dayOfWeek) ||
    toMinutes(first.startHour) - toMinutes(second.startHour)
  );
}

/** Soma da duração das alocações, em minutos (carga horária semanal). */
export function totalMinutes(allocations: Allocation[]): number {
  return allocations.reduce(
    (total, allocation) =>
      total + durationInMinutes(allocation.startHour, allocation.endHour),
    0,
  );
}

type Lookup = {
  professorsById: Map<ID, Professor>;
  coursesById: Map<ID, Course>;
  departmentsById: Map<ID, Department>;
};

export function buildAllocationViews(
  allocations: Allocation[],
  lookup: Lookup,
): AllocationView[] {
  return allocations
    .map((allocation) => {
      const professor = allocation.professorId
        ? lookup.professorsById.get(allocation.professorId)
        : undefined;

      return {
        ...allocation,
        professor,
        course: allocation.courseId
          ? lookup.coursesById.get(allocation.courseId)
          : undefined,
        department: professor?.departmentId
          ? lookup.departmentsById.get(professor.departmentId)
          : undefined,
        hasConflict: findConflicts(allocation, allocations).length > 0,
      };
    })
    .sort(compareAllocations);
}
