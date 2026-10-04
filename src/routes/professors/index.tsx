import {
  Avatar,
  Badge,
  Button,
  Flex,
  HStack,
  Icon,
  Select,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, SearchX, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useAcademicData } from "@/api/queries";
import { DataTable, type Column } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { IconButtonLink, RouterLink } from "@/components/links";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { QueryErrorState } from "@/components/QueryErrorState";
import { RowActions } from "@/components/RowActions";
import { SearchInput } from "@/components/SearchInput";
import { DeleteProfessorDialog } from "@/features/professors/DeleteProfessorDialog";
import {
  ProfessorFormDrawer,
  type ProfessorDrawerData,
} from "@/features/professors/ProfessorFormDrawer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useOverlay } from "@/hooks/useOverlay";
import { totalMinutes } from "@/lib/allocations";
import { groupBy } from "@/lib/collections";
import { formatCpf, onlyDigits } from "@/lib/cpf";
import { matchesSearch, pluralize } from "@/lib/text";
import { formatDuration } from "@/lib/time";
import type { Professor } from "@/types/entities";

// O filtro de departamento fica na URL (/professors?departmentId=1),
// assim dá para compartilhar o link já filtrado. O roteador entrega ids
// numéricos como number, por isso o `coerce` para texto.
const searchSchema = z.object({
  departmentId: z.coerce.string().optional().catch(undefined),
});

export const Route = createFileRoute("/professors/")({
  validateSearch: (search) => searchSchema.parse(search),
  component: ProfessorsPage,
});

function ProfessorsPage() {
  useDocumentTitle("Professores");

  const { departmentId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [search, setSearch] = useState("");
  const {
    professors,
    departments,
    departmentsById,
    allocations,
    isLoading,
    error,
    refetch,
  } = useAcademicData();
  const formDrawer = useOverlay<ProfessorDrawerData>();
  const deleteDialog = useOverlay<Professor>();

  const allocationsByProfessor = useMemo(
    () => groupBy(allocations, (allocation) => allocation.professorId),
    [allocations],
  );

  // Busca por nome (como o GET /professors?name= do backend) ou por CPF.
  const searchDigits = onlyDigits(search);
  const rows = professors.filter(
    (professor) =>
      (!departmentId || professor.departmentId === departmentId) &&
      (matchesSearch(professor.name, search) ||
        (searchDigits.length > 0 && professor.cpf.includes(searchDigits))),
  );
  const hasFilters = Boolean(search || departmentId);

  function setDepartmentFilter(value: string) {
    void navigate({
      search: (previous) => ({ ...previous, departmentId: value || undefined }),
      replace: true,
    });
  }

  function clearFilters() {
    setSearch("");
    setDepartmentFilter("");
  }

  const columns: Column<Professor>[] = [
    {
      key: "name",
      header: "Professor",
      cell: (professor) => (
        <HStack spacing="3">
          <Avatar name={professor.name} size="sm" />
          <Stack spacing="0">
            <RouterLink
              to="/professors/$professorId"
              params={{ professorId: professor.id }}
              fontWeight="semibold"
            >
              {professor.name}
            </RouterLink>
            <Text
              display={{ base: "block", md: "none" }}
              fontSize="xs"
              color="fg.muted"
            >
              {formatCpf(professor.cpf)}
            </Text>
          </Stack>
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
      key: "department",
      header: "Departamento",
      hideBelow: "md",
      cell: (professor) => {
        const department = professor.departmentId
          ? departmentsById.get(professor.departmentId)
          : undefined;

        return department ? (
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
          <Badge colorScheme="orange" variant="subtle">
            Sem departamento
          </Badge>
        );
      },
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
          onEdit={() => formDrawer.open({ professor })}
          onDelete={() => deleteDialog.open(professor)}
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
      onClick={() => formDrawer.open({ departmentId })}
    >
      Novo professor
    </Button>
  );

  return (
    <PageContainer>
      <PageHeader
        icon={Users}
        title="Professores"
        description="Cadastro de professores com CPF e departamento."
        actions={newProfessorButton}
      />

      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        gap="3"
        mb="4"
      >
        <Flex direction={{ base: "column", sm: "row" }} gap="3" flex="1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nome ou CPF"
          />
          <Select
            maxW={{ sm: "64" }}
            bg="bg.surface"
            value={departmentId ?? ""}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            aria-label="Filtrar por departamento"
          >
            <option value="">Todos os departamentos</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </Select>
        </Flex>
        {!isLoading && !error && (
          <Text fontSize="sm" color="fg.muted" flexShrink={0}>
            {rows.length} de{" "}
            {pluralize(professors.length, "professor", "professores")}
          </Text>
        )}
      </Flex>

      {error ? (
        <QueryErrorState error={error} onRetry={refetch} />
      ) : (
        <DataTable
          label="Lista de professores"
          columns={columns}
          rows={rows}
          getRowId={(professor) => professor.id}
          isLoading={isLoading}
          emptyState={
            hasFilters ? (
              <EmptyState
                icon={SearchX}
                title="Nenhum professor encontrado"
                description="Nenhum professor corresponde aos filtros aplicados."
                action={
                  <Button variant="ghost" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Users}
                title="Nenhum professor cadastrado"
                description="Cadastre professores para poder alocá-los nos cursos."
                action={newProfessorButton}
              />
            )
          }
        />
      )}

      <ProfessorFormDrawer
        isOpen={formDrawer.isOpen}
        onClose={formDrawer.close}
        data={formDrawer.data}
        formKey={formDrawer.key}
      />
      <DeleteProfessorDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        professor={deleteDialog.data}
      />
    </PageContainer>
  );
}
