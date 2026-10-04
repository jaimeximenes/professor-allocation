/**
 * Tipos que espelham os DTOs da API REST do backend
 * (atividade_backend: pacote com.project.professor.allocation.dto).
 *
 * Os DTOs são planos: os relacionamentos @ManyToOne das entidades JPA
 * (Professor -> Department, Allocation -> Professor/Course) chegam como
 * `departmentId`, `professorId` e `courseId`, a mesma convenção do json-server.
 */

/** Long no backend; tratado como texto no frontend (ex.: parâmetros de rota). */
export type ID = string;

/** Mesmos valores do enum java.time.DayOfWeek (persistido como STRING). */
export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

/** DepartmentDTO: name obrigatório, até 100 caracteres e único. */
export type Department = {
  id: ID;
  name: string;
};

/** CourseDTO: name obrigatório, até 100 caracteres e único. */
export type Course = {
  id: ID;
  name: string;
};

/** ProfessorDTO: cpf com exatamente 11 dígitos (único) e departamento obrigatório. */
export type Professor = {
  id: ID;
  name: string;
  cpf: string;
  /** Pode ficar null no json-server quando o departamento é excluído. */
  departmentId: ID | null;
};

/** AllocationDTO: dia da semana, horários (LocalTime) e as duas associações. */
export type Allocation = {
  id: ID;
  dayOfWeek: DayOfWeek;
  /** LocalTime serializado como "HH:mm:ss". */
  startHour: string;
  /** LocalTime serializado como "HH:mm:ss". */
  endHour: string;
  professorId: ID | null;
  courseId: ID | null;
};

/** Corpo enviado nas requisições POST/PUT (o id é gerado pela API). */
export type EntityInput<T extends { id: ID }> = Omit<T, "id">;
