import { Box, Button, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  CalendarPlus,
  Pencil,
  Timer,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { coursesApi, useAcademicData } from "@/api/queries";
import { DataTable, type Column } from "@/components/DataTable";
import { DetailPageError, DetailPageSkeleton } from "@/components/DetailStates";
import { EmptyState } from "@/components/EmptyState";
import { RouterLink } from "@/components/links";
import {
  PageContainer,
  PageHeader,
  SectionHeader,
} from "@/components/PageHeader";
import { RowActions } from "@/components/RowActions";
import { StatCard } from "@/components/StatCard";
import {
  AllocationFormDrawer,
  type AllocationDrawerData,
} from "@/features/allocations/AllocationFormDrawer";
import { DeleteAllocationDialog } from "@/features/allocations/DeleteAllocationDialog";
import { CourseFormDrawer } from "@/features/courses/CourseFormDrawer";
import { DeleteCourseDialog } from "@/features/courses/DeleteCourseDialog";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useOverlay } from "@/hooks/useOverlay";
import { totalMinutes, type AllocationView } from "@/lib/allocations";
import { DAY_LABELS } from "@/lib/days";
import { formatDuration, formatHour } from "@/lib/time";
import type { Course } from "@/types/entities";

export const Route = createFileRoute("/courses/$courseId")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const navigate = Route.useNavigate();
  const courseQuery = coursesApi.useOne(courseId);
  const { allocationViews } = useAcademicData();

  const editDrawer = useOverlay<Course>();
  const deleteDialog = useOverlay<Course>();
  const allocationDrawer = useOverlay<AllocationDrawerData>();
  const deleteAllocationDialog = useOverlay<AllocationView>();

  useDocumentTitle(courseQuery.data?.name ?? "Curso");

  const courseAllocations = useMemo(
    () =>
      allocationViews.filter((allocation) => allocation.courseId === courseId),
    [allocationViews, courseId],
  );

  if (courseQuery.isPending) {
    return <DetailPageSkeleton />;
  }

  if (courseQuery.isError) {
    return (
      <DetailPageError
        error={courseQuery.error}
        onRetry={() => void courseQuery.refetch()}
        notFoundTitle="Curso não encontrado"
        backTo="/courses"
        backLabel="Voltar para cursos"
      />
    );
  }

  const course = courseQuery.data;
  const professorCount = new Set(
    courseAllocations.map((allocation) => allocation.professorId),
  ).size;

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
        <Text fontFamily="mono" fontSize="sm">
          {formatHour(allocation.startHour)}–{formatHour(allocation.endHour)}
        </Text>
      ),
    },
    {
      key: "professor",
      header: "Professor",
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
      key: "actions",
      header: "Ações",
      isNumeric: true,
      cell: (allocation) => (
        <RowActions
          label={`a aula de ${DAY_LABELS[allocation.dayOfWeek].long}`}
          onEdit={() => allocationDrawer.open({ allocation })}
          onDelete={() => deleteAllocationDialog.open(allocation)}
        />
      ),
    },
  ];

  const newAllocationButton = (
    <Button
      leftIcon={<Icon as={CalendarPlus} boxSize="4" />}
      onClick={() => allocationDrawer.open({ courseId: course.id })}
    >
      Nova alocação
    </Button>
  );

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={[
          { label: "Cursos", to: "/courses" },
          { label: course.name },
        ]}
        title={course.name}
        description="Curso"
        actions={
          <>
            <Button
              variant="outline"
              colorScheme="gray"
              leftIcon={<Icon as={Pencil} boxSize="4" />}
              onClick={() => editDrawer.open(course)}
            >
              Editar
            </Button>
            <Button
              variant="outline"
              colorScheme="red"
              leftIcon={<Icon as={Trash2} boxSize="4" />}
              onClick={() => deleteDialog.open(course)}
            >
              Excluir
            </Button>
          </>
        }
      />

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4" mb="10">
        <StatCard
          label="Aulas na semana"
          value={courseAllocations.length}
          icon={CalendarClock}
        />
        <StatCard label="Professores" value={professorCount} icon={Users} />
        <StatCard
          label="Carga horária semanal"
          value={formatDuration(totalMinutes(courseAllocations))}
          icon={Timer}
        />
      </SimpleGrid>

      <Box as="section">
        <SectionHeader
          title="Aulas do curso"
          description="Alocações deste curso na grade semanal, em ordem de dia e horário."
          actions={
            courseAllocations.length > 0 ? newAllocationButton : undefined
          }
        />
        <DataTable
          label={`Aulas do curso ${course.name}`}
          columns={columns}
          rows={courseAllocations}
          getRowId={(allocation) => allocation.id}
          emptyState={
            <EmptyState
              icon={CalendarClock}
              title="Nenhuma aula alocada"
              description="Aloque um professor para dar aulas deste curso."
              action={newAllocationButton}
            />
          }
        />
      </Box>

      <CourseFormDrawer
        isOpen={editDrawer.isOpen}
        onClose={editDrawer.close}
        course={editDrawer.data}
        formKey={editDrawer.key}
      />
      <DeleteCourseDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        course={deleteDialog.data}
        onDeleted={() => void navigate({ to: "/courses" })}
      />
      <AllocationFormDrawer
        isOpen={allocationDrawer.isOpen}
        onClose={allocationDrawer.close}
        data={allocationDrawer.data}
        formKey={allocationDrawer.key}
      />
      <DeleteAllocationDialog
        isOpen={deleteAllocationDialog.isOpen}
        onClose={deleteAllocationDialog.close}
        allocation={deleteAllocationDialog.data}
      />
    </PageContainer>
  );
}
