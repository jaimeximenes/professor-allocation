import {
  Avatar,
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarClock,
  CalendarPlus,
  Pencil,
  Timer,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";
import { professorsApi, useAcademicData } from "@/api/queries";
import { DetailPageError, DetailPageSkeleton } from "@/components/DetailStates";
import { EmptyState } from "@/components/EmptyState";
import { RouterLink } from "@/components/links";
import {
  PageContainer,
  PageHeader,
  SectionHeader,
} from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { WeekSchedule } from "@/components/WeekSchedule";
import {
  AllocationFormDrawer,
  type AllocationDrawerData,
} from "@/features/allocations/AllocationFormDrawer";
import { DeleteAllocationDialog } from "@/features/allocations/DeleteAllocationDialog";
import { DeleteProfessorDialog } from "@/features/professors/DeleteProfessorDialog";
import {
  ProfessorFormDrawer,
  type ProfessorDrawerData,
} from "@/features/professors/ProfessorFormDrawer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useOverlay } from "@/hooks/useOverlay";
import { totalMinutes, type AllocationView } from "@/lib/allocations";
import { formatCpf } from "@/lib/cpf";
import { formatDuration } from "@/lib/time";
import type { Professor } from "@/types/entities";

export const Route = createFileRoute("/professors/$professorId")({
  component: ProfessorDetailPage,
});

function ProfessorDetailPage() {
  const { professorId } = Route.useParams();
  const navigate = Route.useNavigate();
  const professorQuery = professorsApi.useOne(professorId);
  const { allocationViews, departmentsById } = useAcademicData();

  const editDrawer = useOverlay<ProfessorDrawerData>();
  const deleteDialog = useOverlay<Professor>();
  const allocationDrawer = useOverlay<AllocationDrawerData>();
  const deleteAllocationDialog = useOverlay<AllocationView>();

  useDocumentTitle(professorQuery.data?.name ?? "Professor");

  const professorAllocations = useMemo(
    () =>
      allocationViews.filter(
        (allocation) => allocation.professorId === professorId,
      ),
    [allocationViews, professorId],
  );

  if (professorQuery.isPending) {
    return <DetailPageSkeleton />;
  }

  if (professorQuery.isError) {
    return (
      <DetailPageError
        error={professorQuery.error}
        onRetry={() => void professorQuery.refetch()}
        notFoundTitle="Professor não encontrado"
        backTo="/professors"
        backLabel="Voltar para professores"
      />
    );
  }

  const professor = professorQuery.data;
  const department = professor.departmentId
    ? departmentsById.get(professor.departmentId)
    : undefined;
  const courseCount = new Set(professorAllocations.map((item) => item.courseId))
    .size;

  const newAllocationButton = (
    <Button
      leftIcon={<Icon as={CalendarPlus} boxSize="4" />}
      onClick={() => allocationDrawer.open({ professorId: professor.id })}
    >
      Nova alocação
    </Button>
  );

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={[
          { label: "Professores", to: "/professors" },
          { label: professor.name },
        ]}
        title={
          <HStack as="span" spacing="4" align="center">
            <Avatar name={professor.name} size="md" />
            <Text as="span">{professor.name}</Text>
          </HStack>
        }
        description={
          <Stack
            as="span"
            direction={{ base: "column", sm: "row" }}
            spacing={{ base: 1, sm: 3 }}
            mt="1"
          >
            <Text as="span" fontFamily="mono" fontSize="sm">
              CPF {formatCpf(professor.cpf)}
            </Text>
            {department ? (
              <RouterLink
                to="/departments/$departmentId"
                params={{ departmentId: department.id }}
                _hover={{ textDecoration: "none" }}
              >
                <Badge colorScheme="brand" variant="subtle">
                  {department.name}
                </Badge>
              </RouterLink>
            ) : (
              <Badge
                colorScheme="orange"
                variant="subtle"
                alignSelf="flex-start"
              >
                Sem departamento
              </Badge>
            )}
          </Stack>
        }
        actions={
          <>
            <Button
              variant="outline"
              colorScheme="gray"
              leftIcon={<Icon as={Pencil} boxSize="4" />}
              onClick={() => editDrawer.open({ professor })}
            >
              Editar
            </Button>
            <Button
              variant="outline"
              colorScheme="red"
              leftIcon={<Icon as={Trash2} boxSize="4" />}
              onClick={() => deleteDialog.open(professor)}
            >
              Excluir
            </Button>
          </>
        }
      />

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4" mb="10">
        <StatCard
          label="Aulas na semana"
          value={professorAllocations.length}
          icon={CalendarClock}
        />
        <StatCard
          label="Carga horária semanal"
          value={formatDuration(totalMinutes(professorAllocations))}
          icon={Timer}
        />
        <StatCard
          label="Cursos ministrados"
          value={courseCount}
          icon={BookOpen}
        />
      </SimpleGrid>

      <Box as="section">
        <SectionHeader
          title="Grade semanal"
          description="Aulas do professor organizadas por dia da semana."
          actions={
            professorAllocations.length > 0 ? newAllocationButton : undefined
          }
        />

        {professorAllocations.length > 0 ? (
          <WeekSchedule
            allocations={professorAllocations}
            showProfessor={false}
            onCreate={(dayOfWeek) =>
              allocationDrawer.open({ professorId: professor.id, dayOfWeek })
            }
            onEdit={(allocation) => allocationDrawer.open({ allocation })}
            onDelete={(allocation) => deleteAllocationDialog.open(allocation)}
          />
        ) : (
          <EmptyState
            icon={CalendarClock}
            title="Nenhuma aula alocada"
            description="Este professor ainda não tem aulas na grade semanal."
            action={newAllocationButton}
          />
        )}
      </Box>

      <ProfessorFormDrawer
        isOpen={editDrawer.isOpen}
        onClose={editDrawer.close}
        data={editDrawer.data}
        formKey={editDrawer.key}
      />
      <DeleteProfessorDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        professor={deleteDialog.data}
        onDeleted={() => void navigate({ to: "/professors" })}
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
