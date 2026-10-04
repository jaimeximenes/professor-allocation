import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  Icon,
  Select,
  SimpleGrid,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  CalendarPlus,
  FilterX,
  LayoutGrid,
  List,
  SearchX,
} from "lucide-react";
import { z } from "zod";
import { useAcademicData } from "@/api/queries";
import { DataTable, type Column } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { RouterLink } from "@/components/links";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { QueryErrorState } from "@/components/QueryErrorState";
import { RowActions } from "@/components/RowActions";
import { WeekSchedule } from "@/components/WeekSchedule";
import {
  AllocationFormDrawer,
  type AllocationDrawerData,
} from "@/features/allocations/AllocationFormDrawer";
import { DeleteAllocationDialog } from "@/features/allocations/DeleteAllocationDialog";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useOverlay } from "@/hooks/useOverlay";
import { totalMinutes, type AllocationView } from "@/lib/allocations";
import { courseColor } from "@/lib/colors";
import { DAY_LABELS } from "@/lib/days";
import { pluralize } from "@/lib/text";
import { formatDuration, formatHour } from "@/lib/time";
import { DAYS_OF_WEEK } from "@/types/entities";

// Filtros e modo de visualização ficam na URL, ex.:
// /allocations?view=table&professorId=1&day=MONDAY
// (o roteador entrega ids numéricos como number, por isso o `coerce`).
const searchSchema = z.object({
  view: z.enum(["board", "table"]).optional().catch(undefined),
  professorId: z.coerce.string().optional().catch(undefined),
  courseId: z.coerce.string().optional().catch(undefined),
  day: z.enum(DAYS_OF_WEEK).optional().catch(undefined),
});

type AllocationsSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/allocations/")({
  validateSearch: (search) => searchSchema.parse(search),
  component: AllocationsPage,
});

function AllocationsPage() {
  useDocumentTitle("Alocações");

  const { view = "board", professorId, courseId, day } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { allocationViews, professors, courses, isLoading, error, refetch } =
    useAcademicData();
  const formDrawer = useOverlay<AllocationDrawerData>();
  const deleteDialog = useOverlay<AllocationView>();

  const rows = allocationViews.filter(
    (allocation) =>
      (!professorId || allocation.professorId === professorId) &&
      (!courseId || allocation.courseId === courseId) &&
      (!day || allocation.dayOfWeek === day),
  );
  const hasFilters = Boolean(professorId || courseId || day);
  const conflictCount = allocationViews.filter(
    (item) => item.hasConflict,
  ).length;
  const allocatedProfessors = new Set(rows.map((item) => item.professorId))
    .size;

  function updateSearch(changes: Partial<AllocationsSearch>) {
    void navigate({
      search: (previous) => ({ ...previous, ...changes }),
      replace: true,
    });
  }

  function clearFilters() {
    updateSearch({
      professorId: undefined,
      courseId: undefined,
      day: undefined,
    });
  }

  function openCreate(dayOfWeek = day) {
    formDrawer.open({ professorId, courseId, dayOfWeek });
  }

  const columns: Column<AllocationView>[] = [
    {
      key: "day",
      header: "Dia",
      cell: (allocation) => (
        <Text fontWeight="medium">{DAY_LABELS[allocation.dayOfWeek].long}</Text>
      ),
    },
    {
      key: "time",
      header: "Horário",
      cell: (allocation) => (
        <HStack spacing="2">
          <Text fontFamily="mono" fontSize="sm">
            {formatHour(allocation.startHour)}–{formatHour(allocation.endHour)}
          </Text>
          {allocation.hasConflict && (
            <Badge colorScheme="red" fontSize="2xs">
              Conflito
            </Badge>
          )}
        </HStack>
      ),
    },
    {
      key: "course",
      header: "Curso",
      cell: (allocation) => (
        <HStack spacing="2">
          <Box
            boxSize="2.5"
            rounded="full"
            flexShrink={0}
            bg={`${courseColor(allocation.courseId)}.400`}
          />
          {allocation.course ? (
            <RouterLink
              to="/courses/$courseId"
              params={{ courseId: allocation.course.id }}
              fontWeight="semibold"
            >
              {allocation.course.name}
            </RouterLink>
          ) : (
            <Text color="fg.muted">Curso removido</Text>
          )}
        </HStack>
      ),
    },
    {
      key: "professor",
      header: "Professor",
      hideBelow: "md",
      cell: (allocation) =>
        allocation.professor ? (
          <RouterLink
            to="/professors/$professorId"
            params={{ professorId: allocation.professor.id }}
          >
            {allocation.professor.name}
          </RouterLink>
        ) : (
          <Text color="fg.muted">Professor removido</Text>
        ),
    },
    {
      key: "department",
      header: "Departamento",
      hideBelow: "lg",
      cell: (allocation) => (
        <Text fontSize="sm" color="fg.muted">
          {allocation.department?.name ?? "—"}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      isNumeric: true,
      cell: (allocation) => (
        <RowActions
          label={`a aula de ${allocation.course?.name ?? "curso removido"}`}
          onEdit={() => formDrawer.open({ allocation })}
          onDelete={() => deleteDialog.open(allocation)}
        />
      ),
    },
  ];

  const newAllocationButton = (
    <Button
      leftIcon={<Icon as={CalendarPlus} boxSize="4" />}
      onClick={() => openCreate()}
    >
      Nova alocação
    </Button>
  );

  const emptyState = hasFilters ? (
    <EmptyState
      icon={SearchX}
      title="Nenhuma alocação encontrada"
      description="Nenhuma aula corresponde aos filtros aplicados."
      action={
        <Button variant="ghost" onClick={clearFilters}>
          Limpar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={CalendarClock}
      title="Nenhuma alocação cadastrada"
      description="Aloque professores em cursos, definindo o dia da semana e o horário de cada aula."
      action={newAllocationButton}
    />
  );

  function renderContent() {
    if (error) {
      return <QueryErrorState error={error} onRetry={refetch} />;
    }

    if (view === "table") {
      return (
        <DataTable
          label="Lista de alocações"
          columns={columns}
          rows={rows}
          getRowId={(allocation) => allocation.id}
          isLoading={isLoading}
          emptyState={emptyState}
        />
      );
    }

    if (isLoading) {
      return (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 6 }} spacing="4">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} h="56" rounded="xl" />
          ))}
        </SimpleGrid>
      );
    }

    if (rows.length === 0) {
      return emptyState;
    }

    return (
      <WeekSchedule
        allocations={rows}
        days={day ? [day] : undefined}
        onCreate={openCreate}
        onEdit={(allocation) => formDrawer.open({ allocation })}
        onDelete={(allocation) => deleteDialog.open(allocation)}
      />
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon={CalendarClock}
        title="Alocações"
        description="Grade semanal de aulas: qual professor dá qual curso, em que dia e horário."
        actions={newAllocationButton}
      />

      <Flex
        direction={{ base: "column", lg: "row" }}
        align={{ base: "stretch", lg: "center" }}
        justify="space-between"
        gap="3"
        mb="4"
      >
        <Flex direction={{ base: "column", md: "row" }} gap="3" flex="1">
          <Select
            bg="bg.surface"
            maxW={{ md: "60" }}
            value={professorId ?? ""}
            onChange={(event) =>
              updateSearch({ professorId: event.target.value || undefined })
            }
            aria-label="Filtrar por professor"
          >
            <option value="">Todos os professores</option>
            {professors.map((professor) => (
              <option key={professor.id} value={professor.id}>
                {professor.name}
              </option>
            ))}
          </Select>

          <Select
            bg="bg.surface"
            maxW={{ md: "60" }}
            value={courseId ?? ""}
            onChange={(event) =>
              updateSearch({ courseId: event.target.value || undefined })
            }
            aria-label="Filtrar por curso"
          >
            <option value="">Todos os cursos</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>

          <Select
            bg="bg.surface"
            maxW={{ md: "48" }}
            value={day ?? ""}
            onChange={(event) =>
              updateSearch({
                day: DAYS_OF_WEEK.find((item) => item === event.target.value),
              })
            }
            aria-label="Filtrar por dia da semana"
          >
            <option value="">Todos os dias</option>
            {DAYS_OF_WEEK.map((item) => (
              <option key={item} value={item}>
                {DAY_LABELS[item].long}
              </option>
            ))}
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              colorScheme="gray"
              leftIcon={<Icon as={FilterX} boxSize="4" />}
              onClick={clearFilters}
              flexShrink={0}
            >
              Limpar
            </Button>
          )}
        </Flex>

        <ButtonGroup
          size="sm"
          isAttached
          alignSelf={{ base: "flex-start", lg: "center" }}
        >
          <Button
            variant={view === "board" ? "solid" : "outline"}
            leftIcon={<Icon as={LayoutGrid} boxSize="4" />}
            aria-pressed={view === "board"}
            onClick={() => updateSearch({ view: undefined })}
          >
            Grade
          </Button>
          <Button
            variant={view === "table" ? "solid" : "outline"}
            leftIcon={<Icon as={List} boxSize="4" />}
            aria-pressed={view === "table"}
            onClick={() => updateSearch({ view: "table" })}
          >
            Lista
          </Button>
        </ButtonGroup>
      </Flex>

      {!isLoading && !error && (
        <HStack
          spacing="2"
          mb="4"
          fontSize="sm"
          color="fg.muted"
          flexWrap="wrap"
        >
          <Text>
            {pluralize(rows.length, "aula", "aulas")} ·{" "}
            {formatDuration(totalMinutes(rows))} semanais ·{" "}
            {pluralize(allocatedProfessors, "professor", "professores")}
          </Text>
        </HStack>
      )}

      {conflictCount > 0 && (
        <Alert status="warning" rounded="lg" mb="4">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            {pluralize(conflictCount, "aula está", "aulas estão")} com conflito
            de horário (mesmo professor, mesmo dia, horários sobrepostos). Elas
            estão destacadas em vermelho.
          </AlertDescription>
        </Alert>
      )}

      {renderContent()}

      <AllocationFormDrawer
        isOpen={formDrawer.isOpen}
        onClose={formDrawer.close}
        data={formDrawer.data}
        formKey={formDrawer.key}
      />
      <DeleteAllocationDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        allocation={deleteDialog.data}
      />
    </PageContainer>
  );
}
