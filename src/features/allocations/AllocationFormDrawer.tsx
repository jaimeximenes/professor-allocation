import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  DrawerBody,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  Input,
  ListItem,
  Select,
  SimpleGrid,
  Stack,
  Text,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage } from "@/api/errors";
import { allocationsApi, useAcademicData } from "@/api/queries";
import { FormDrawer, FormDrawerFooter } from "@/components/FormDrawer";
import { ButtonLink } from "@/components/links";
import { findConflicts } from "@/lib/allocations";
import { groupBy } from "@/lib/collections";
import { DAY_LABELS } from "@/lib/days";
import {
  durationInMinutes,
  formatDuration,
  formatHour,
  toLocalTime,
  toMinutes,
} from "@/lib/time";
import {
  DAYS_OF_WEEK,
  type Allocation,
  type DayOfWeek,
  type ID,
} from "@/types/entities";

const FORM_ID = "allocation-form";
const TIME_PATTERN = /^\d{2}:\d{2}(:\d{2})?$/;

// Mesmas regras do AllocationDTO (@NotNull em todos os campos) e do
// AllocationService (início anterior ao término).
const allocationSchema = z
  .object({
    professorId: z.string().min(1, "O professor é obrigatório."),
    courseId: z.string().min(1, "O curso é obrigatório."),
    dayOfWeek: z.enum(DAYS_OF_WEEK, {
      error: "O dia da semana é obrigatório.",
    }),
    startHour: z
      .string()
      .regex(TIME_PATTERN, "A hora de início é obrigatória."),
    endHour: z.string().regex(TIME_PATTERN, "A hora de término é obrigatória."),
  })
  .refine((values) => toMinutes(values.startHour) < toMinutes(values.endHour), {
    path: ["endHour"],
    message: "A hora de início deve ser anterior à hora de término.",
  });

type AllocationFormValues = z.infer<typeof allocationSchema>;

export type AllocationDrawerData = {
  /** Alocação em edição; ausente ao cadastrar uma nova. */
  allocation?: Allocation;
  /** Valores já preenchidos ao cadastrar (ex.: a partir da página do professor). */
  professorId?: ID;
  courseId?: ID;
  dayOfWeek?: DayOfWeek;
};

type AllocationFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  data: AllocationDrawerData | null;
  /** Muda a cada abertura para recriar o formulário com valores limpos. */
  formKey: number;
};

export function AllocationFormDrawer({
  isOpen,
  onClose,
  data,
  formKey,
}: AllocationFormDrawerProps) {
  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={data?.allocation ? "Editar alocação" : "Nova alocação"}
      description="Defina quem dá a aula, de qual curso, em que dia e horário."
    >
      <AllocationForm key={formKey} data={data ?? {}} onClose={onClose} />
    </FormDrawer>
  );
}

function AllocationForm({
  data,
  onClose,
}: {
  data: AllocationDrawerData;
  onClose: () => void;
}) {
  const toast = useToast();
  const {
    professors,
    courses,
    departments,
    allocations,
    allocationViews,
    professorsById,
    coursesById,
    isLoading,
  } = useAcademicData();
  const saveAllocation = allocationsApi.useSave();
  const { allocation } = data;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      professorId: allocation?.professorId ?? data.professorId ?? "",
      courseId: allocation?.courseId ?? data.courseId ?? "",
      dayOfWeek: allocation?.dayOfWeek ?? data.dayOfWeek ?? "MONDAY",
      startHour: allocation ? formatHour(allocation.startHour) : "08:00",
      endHour: allocation ? formatHour(allocation.endHour) : "10:00",
    },
  });

  // Acompanha os campos para validar o choque de horário enquanto o usuário edita.
  const [professorId, dayOfWeek, startHour, endHour] = useWatch({
    control,
    name: ["professorId", "dayOfWeek", "startHour", "endHour"],
  });

  // Depois de salvar, a lista recarregada já contém a nova alocação; a checagem
  // é desligada para ela não aparecer como conflito enquanto o drawer fecha.
  const shouldCheckSchedule = Boolean(professorId) && !saveAllocation.isSuccess;

  const hasValidRange =
    TIME_PATTERN.test(startHour) &&
    TIME_PATTERN.test(endHour) &&
    toMinutes(startHour) < toMinutes(endHour);

  const conflicts =
    shouldCheckSchedule && hasValidRange
      ? findConflicts(
          { id: allocation?.id, professorId, dayOfWeek, startHour, endHour },
          allocations,
        )
      : [];

  const otherClassesThatDay = shouldCheckSchedule
    ? allocationViews.filter(
        (item) =>
          item.professorId === professorId &&
          item.dayOfWeek === dayOfWeek &&
          item.id !== allocation?.id,
      )
    : [];

  const professorName = professorsById.get(professorId)?.name ?? "O professor";
  const missingPrerequisites =
    !isLoading && (professors.length === 0 || courses.length === 0);

  // Professores agrupados por departamento no <select>.
  const professorGroups = useMemo(() => {
    const byDepartment = groupBy(
      professors,
      (professor) => professor.departmentId,
    );
    const groups = departments
      .map((department) => ({
        label: department.name,
        professors: byDepartment.get(department.id) ?? [],
      }))
      .filter((group) => group.professors.length > 0);

    const withoutDepartment = professors.filter(
      (professor) =>
        !professor.departmentId ||
        !departments.some(
          (department) => department.id === professor.departmentId,
        ),
    );

    return withoutDepartment.length > 0
      ? [
          ...groups,
          { label: "Sem departamento", professors: withoutDepartment },
        ]
      : groups;
  }, [professors, departments]);

  const onSubmit = handleSubmit(async (values) => {
    // O backend também valida (HTTP 400), mas evitamos a requisição.
    if (
      findConflicts({ ...values, id: allocation?.id }, allocations).length > 0
    ) {
      toast({
        status: "error",
        title: "Conflito de horário",
        description: "O professor já possui uma alocação nesse horário.",
      });
      return;
    }

    const payload = {
      dayOfWeek: values.dayOfWeek,
      startHour: toLocalTime(values.startHour),
      endHour: toLocalTime(values.endHour),
      professorId: values.professorId,
      courseId: values.courseId,
    };

    try {
      await saveAllocation.mutateAsync({ id: allocation?.id, data: payload });
      toast({
        status: "success",
        title: allocation ? "Alocação atualizada" : "Alocação cadastrada",
        description: `${coursesById.get(values.courseId)?.name ?? "Curso"} · ${
          DAY_LABELS[values.dayOfWeek].long
        }, ${formatHour(values.startHour)}–${formatHour(values.endHour)}`,
      });
      onClose();
    } catch (error) {
      toast({
        status: "error",
        title: "Não foi possível salvar a alocação",
        description: getErrorMessage(error),
      });
    }
  });

  return (
    <>
      <DrawerBody py="6">
        <form id={FORM_ID} onSubmit={onSubmit} noValidate>
          <Stack spacing="5">
            {missingPrerequisites && (
              <Alert status="warning" rounded="md" alignItems="flex-start">
                <AlertIcon />
                <Box>
                  <AlertDescription fontSize="sm">
                    Para criar alocações é preciso ter ao menos um professor e
                    um curso cadastrados.
                  </AlertDescription>
                  <HStack mt="3" spacing="2">
                    <ButtonLink to="/professors" size="sm" variant="outline">
                      Professores
                    </ButtonLink>
                    <ButtonLink to="/courses" size="sm" variant="outline">
                      Cursos
                    </ButtonLink>
                  </HStack>
                </Box>
              </Alert>
            )}

            <FormControl isInvalid={Boolean(errors.professorId)} isRequired>
              <FormLabel>Professor</FormLabel>
              <Controller
                control={control}
                name="professorId"
                render={({ field }) => (
                  <Select {...field} placeholder="Selecione o professor">
                    {professorGroups.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.professors.map((professor) => (
                          <option key={professor.id} value={professor.id}>
                            {professor.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                )}
              />
              <FormErrorMessage>{errors.professorId?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.courseId)} isRequired>
              <FormLabel>Curso</FormLabel>
              <Controller
                control={control}
                name="courseId"
                render={({ field }) => (
                  <Select {...field} placeholder="Selecione o curso">
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
              <FormErrorMessage>{errors.courseId?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.dayOfWeek)} isRequired>
              <FormLabel>Dia da semana</FormLabel>
              <Select {...register("dayOfWeek")}>
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {DAY_LABELS[day].long}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.dayOfWeek?.message}</FormErrorMessage>
            </FormControl>

            <SimpleGrid columns={2} spacing="4">
              <FormControl isInvalid={Boolean(errors.startHour)} isRequired>
                <FormLabel>Início</FormLabel>
                <Input type="time" step={300} {...register("startHour")} />
                <FormErrorMessage>{errors.startHour?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(errors.endHour)} isRequired>
                <FormLabel>Término</FormLabel>
                <Input type="time" step={300} {...register("endHour")} />
                <FormErrorMessage>{errors.endHour?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            {hasValidRange && (
              <FormControl>
                <FormHelperText mt="-2">
                  Duração da aula:{" "}
                  {formatDuration(durationInMinutes(startHour, endHour))}
                </FormHelperText>
              </FormControl>
            )}

            {conflicts.length > 0 && (
              <Alert status="error" rounded="md" alignItems="flex-start">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Conflito de horário</AlertTitle>
                  <AlertDescription fontSize="sm">
                    {professorName} já tem aula nesse horário:
                    <UnorderedList mt="1">
                      {conflicts.map((conflict) => (
                        <ListItem key={conflict.id}>
                          {coursesById.get(conflict.courseId ?? "")?.name ??
                            "Curso"}{" "}
                          · {formatHour(conflict.startHour)}–
                          {formatHour(conflict.endHour)}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {conflicts.length === 0 && shouldCheckSchedule && hasValidRange && (
              <Stack spacing="2" fontSize="sm">
                <HStack spacing="2" color="green.500">
                  <Icon as={CircleCheck} boxSize="4" />
                  <Text>Sem conflitos de horário para este professor.</Text>
                </HStack>

                {otherClassesThatDay.length > 0 && (
                  <Box color="fg.muted">
                    <Text>
                      Outras aulas de {professorName} (
                      {DAY_LABELS[dayOfWeek].long}):
                    </Text>
                    <UnorderedList mt="1">
                      {otherClassesThatDay.map((item) => (
                        <ListItem key={item.id}>
                          {formatHour(item.startHour)}–
                          {formatHour(item.endHour)} ·{" "}
                          {item.course?.name ?? "Curso removido"}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                )}
              </Stack>
            )}
          </Stack>
        </form>
      </DrawerBody>

      <FormDrawerFooter
        formId={FORM_ID}
        onCancel={onClose}
        isSubmitting={saveAllocation.isPending}
        isDisabled={missingPrerequisites || conflicts.length > 0}
      />
    </>
  );
}
