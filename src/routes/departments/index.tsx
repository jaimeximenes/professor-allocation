import { Badge, Button, Flex, Icon, Text, Tooltip } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Eye, Plus, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { useAcademicData } from "@/api/queries";
import { DataTable, type Column } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { IconButtonLink, RouterLink } from "@/components/links";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { QueryErrorState } from "@/components/QueryErrorState";
import { RowActions } from "@/components/RowActions";
import { SearchInput } from "@/components/SearchInput";
import { DeleteDepartmentDialog } from "@/features/departments/DeleteDepartmentDialog";
import { DepartmentFormDrawer } from "@/features/departments/DepartmentFormDrawer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useOverlay } from "@/hooks/useOverlay";
import { groupBy } from "@/lib/collections";
import { matchesSearch, pluralize } from "@/lib/text";
import type { Department } from "@/types/entities";

export const Route = createFileRoute("/departments/")({
  component: DepartmentsPage,
});

function DepartmentsPage() {
  useDocumentTitle("Departamentos");

  const [search, setSearch] = useState("");
  const { departments, professors, isLoading, error, refetch } =
    useAcademicData();
  const formDrawer = useOverlay<Department>();
  const deleteDialog = useOverlay<Department>();

  const professorsByDepartment = useMemo(
    () => groupBy(professors, (professor) => professor.departmentId),
    [professors],
  );

  const rows = departments.filter((department) =>
    matchesSearch(department.name, search),
  );

  const columns: Column<Department>[] = [
    {
      key: "name",
      header: "Departamento",
      cell: (department) => (
        <RouterLink
          to="/departments/$departmentId"
          params={{ departmentId: department.id }}
          fontWeight="semibold"
        >
          {department.name}
        </RouterLink>
      ),
    },
    {
      key: "professors",
      header: "Professores",
      cell: (department) => {
        const count = professorsByDepartment.get(department.id)?.length ?? 0;

        return (
          <Badge colorScheme={count > 0 ? "brand" : "gray"} variant="subtle">
            {pluralize(count, "professor", "professores")}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "Ações",
      isNumeric: true,
      cell: (department) => (
        <RowActions
          label={department.name}
          onEdit={() => formDrawer.open(department)}
          onDelete={() => deleteDialog.open(department)}
        >
          <Tooltip label="Ver detalhes" hasArrow openDelay={300}>
            <IconButtonLink
              to="/departments/$departmentId"
              params={{ departmentId: department.id }}
              aria-label={`Ver detalhes de ${department.name}`}
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

  const newDepartmentButton = (
    <Button
      leftIcon={<Icon as={Plus} boxSize="4" />}
      onClick={() => formDrawer.open()}
    >
      Novo departamento
    </Button>
  );

  return (
    <PageContainer>
      <PageHeader
        icon={Building2}
        title="Departamentos"
        description="Estrutura acadêmica da instituição. Cada professor pertence a um departamento."
        actions={newDepartmentButton}
      />

      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        gap="3"
        mb="4"
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar departamento"
        />
        {!isLoading && !error && (
          <Text fontSize="sm" color="fg.muted">
            {rows.length} de{" "}
            {pluralize(departments.length, "departamento", "departamentos")}
          </Text>
        )}
      </Flex>

      {error ? (
        <QueryErrorState error={error} onRetry={refetch} />
      ) : (
        <DataTable
          label="Lista de departamentos"
          columns={columns}
          rows={rows}
          getRowId={(department) => department.id}
          isLoading={isLoading}
          emptyState={
            search ? (
              <EmptyState
                icon={SearchX}
                title="Nenhum departamento encontrado"
                description={`Nenhum departamento corresponde a "${search}".`}
                action={
                  <Button variant="ghost" onClick={() => setSearch("")}>
                    Limpar busca
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Building2}
                title="Nenhum departamento cadastrado"
                description="Cadastre o primeiro departamento para começar a vincular professores."
                action={newDepartmentButton}
              />
            )
          }
        />
      )}

      <DepartmentFormDrawer
        isOpen={formDrawer.isOpen}
        onClose={formDrawer.close}
        department={formDrawer.data}
        formKey={formDrawer.key}
      />
      <DeleteDepartmentDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        department={deleteDialog.data}
      />
    </PageContainer>
  );
}
