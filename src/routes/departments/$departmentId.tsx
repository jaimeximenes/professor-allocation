import {
  Avatar,
  Box,
  Button,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  Eye,
  Pencil,
  Timer,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { departmentsApi, useAcademicData } from "@/api/queries";
import { DataTable, type Column } from "@/components/DataTable";
import { DetailPageError, DetailPageSkeleton } from "@/components/DetailStates";
import { EmptyState } from "@/components/EmptyState";
import { IconButtonLink, RouterLink } from "@/components/links";
import {
  PageContainer,
  PageHeader,
  SectionHeader,
} from "@/components/PageHeader";
import { RowActions } from "@/components/RowActions";
import { StatCard } from "@/components/StatCard";
import { DeleteDepartmentDialog } from "@/features/departments/DeleteDepartmentDialog";
import { DepartmentFormDrawer } from "@/features/departments/DepartmentFormDrawer";
import { DeleteProfessorDialog } from "@/features/professors/DeleteProfessorDialog";
import {
  ProfessorFormDrawer,
  type ProfessorDrawerData,
} from "@/features/professors/ProfessorFormDrawer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useOverlay } from "@/hooks/useOverlay";
import { totalMinutes } from "@/lib/allocations";
import { formatCpf } from "@/lib/cpf";
import { groupBy } from "@/lib/collections";
import { pluralize } from "@/lib/text";
import { formatDuration } from "@/lib/time";
import type { Department, Professor } from "@/types/entities";

export const Route = createFileRoute("/departments/$departmentId")({
  component: DepartmentDetailPage,
});

function DepartmentDetailPage() {
  const { departmentId } = Route.useParams();
  const navigate = Route.useNavigate();
  const departmentQuery = departmentsApi.useOne(departmentId);
  const { professors, allocations } = useAcademicData();

  const editDrawer = useOverlay<Department>();
  const deleteDialog = useOverlay<Department>();
  const professorDrawer = useOverlay<ProfessorDrawerData>();
  const deleteProfessorDialog = useOverlay<Professor>();

  useDocumentTitle(departmentQuery.data?.name ?? "Departamento");

  const departmentProfessors = useMemo(
    () =>
      professors.filter((professor) => professor.departmentId === departmentId),
    [professors, departmentId],
  );

  const allocationsByProfessor = useMemo(
    () => groupBy(allocations, (allocation) => allocation.professorId),
    [allocations],
  );

  if (departmentQuery.isPending) {
    return <DetailPageSkeleton />;
  }

  if (departmentQuery.isError) {
    return (
      <DetailPageError
        error={departmentQuery.error}
        onRetry={() => void departmentQuery.refetch()}
        notFoundTitle="Departamento não encontrado"
        backTo="/departments"
        backLabel="Voltar para departamentos"
      />
    );
  }

  const department = departmentQuery.data;
  const departmentAllocations = departmentProfessors.flatMap(
    (professor) => allocationsByProfessor.get(professor.id) ?? [],
  );

  const columns: Column<Professor>[] = [
    {
      key: "name",
      header: "Professor",
      cell: (professor) => (
        <HStack spacing="3">
          <Avatar name={professor.name} size="sm" />
          <RouterLink
            to="/professors/$professorId"
            params={{ professorId: professor.id }}
            fontWeight="semibold"
          >
            {professor.name}
          </RouterLink>
        </HStack>
      ),
    },
    {
      key: "cpf",
      header: "CPF",
      hideBelow: "md",
      cell: (professor) => (
        <Text fontFamily="mono" fontSize="sm">
          {formatCpf(professor.cpf)}
        </Text>
      ),
    },
    {
      key: "allocations",
      header: "Carga semanal",
      hideBelow: "lg",
      cell: (professor) => {
        const items = allocationsByProfessor.get(professor.id) ?? [];

        return (
          <Text fontSize="sm" color="fg.muted">
            {pluralize(items.length, "aula", "aulas")} ·{" "}
            {formatDuration(totalMinutes(items))}
          </Text>
        );
      },
    },
    {
      key: "actions",
      header: "Ações",
      isNumeric: true,
      cell: (professor) => (
        <RowActions
          label={professor.name}
          onEdit={() => professorDrawer.open({ professor })}
          onDelete={() => deleteProfessorDialog.open(professor)}
        >
          <Tooltip label="Ver detalhes" hasArrow openDelay={300}>
            <IconButtonLink
              to="/professors/$professorId"
              params={{ professorId: professor.id }}
              aria-label={`Ver detalhes de ${professor.name}`}
              icon={<Icon as={Eye} boxSize="4" />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
            />
          </Tooltip>
        </RowActions>
      ),
    },
  ];

  const newProfessorButton = (
    <Button
      leftIcon={<Icon as={UserPlus} boxSize="4" />}
      onClick={() => professorDrawer.open({ departmentId: department.id })}
    >
      Novo professor
    </Button>
  );

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={[
          { label: "Departamentos", to: "/departments" },
          { label: department.name },
        ]}
        title={department.name}
        description="Departamento"
        actions={
          <>
            <Button
              variant="outline"
              colorScheme="gray"
              leftIcon={<Icon as={Pencil} boxSize="4" />}
              onClick={() => editDrawer.open(department)}
            >
              Editar
            </Button>
            <Button
              variant="outline"
              colorScheme="red"
              leftIcon={<Icon as={Trash2} boxSize="4" />}
              onClick={() => deleteDialog.open(department)}
            >
              Excluir
            </Button>
          </>
        }
      />

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4" mb="10">
        <StatCard
          label="Professores"
          value={departmentProfessors.length}
          icon={Users}
        />
        <StatCard
          label="Aulas na semana"
          value={departmentAllocations.length}
          icon={CalendarClock}
        />
        <StatCard
          label="Carga horária semanal"
          value={formatDuration(totalMinutes(departmentAllocations))}
          icon={Timer}
          helpText="Soma das aulas dos professores do departamento"
        />
      </SimpleGrid>

      <Box as="section">
        <SectionHeader
          title="Professores do departamento"
          description="Professores vinculados a este departamento."
          actions={
            departmentProfessors.length > 0 ? newProfessorButton : undefined
          }
        />
        <DataTable
          label={`Professores do departamento ${department.name}`}
          columns={columns}
          rows={departmentProfessors}
          getRowId={(professor) => professor.id}
          emptyState={
            <EmptyState
              icon={Users}
              title="Nenhum professor neste departamento"
              description="Cadastre um professor já vinculado a este departamento."
              action={newProfessorButton}
            />
          }
        />
      </Box>

      <DepartmentFormDrawer
        isOpen={editDrawer.isOpen}
        onClose={editDrawer.close}
        department={editDrawer.data}
        formKey={editDrawer.key}
      />
      <DeleteDepartmentDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        department={deleteDialog.data}
        onDeleted={() => void navigate({ to: "/departments" })}
      />
      <ProfessorFormDrawer
        isOpen={professorDrawer.isOpen}
        onClose={professorDrawer.close}
        data={professorDrawer.data}
        formKey={professorDrawer.key}
      />
      <DeleteProfessorDialog
        isOpen={deleteProfessorDialog.isOpen}
        onClose={deleteProfessorDialog.close}
        professor={deleteProfessorDialog.data}
      />
    </PageContainer>
  );
}
