import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Eye, Plus, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { useAcademicData } from "@/api/queries";
import { DataTable, type Column } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { IconButtonLink, RouterLink } from "@/components/links";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { QueryErrorState } from "@/components/QueryErrorState";
import { RowActions } from "@/components/RowActions";
import { SearchInput } from "@/components/SearchInput";
import { CourseFormDrawer } from "@/features/courses/CourseFormDrawer";
import { DeleteCourseDialog } from "@/features/courses/DeleteCourseDialog";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useOverlay } from "@/hooks/useOverlay";
import { totalMinutes } from "@/lib/allocations";
import { groupBy } from "@/lib/collections";
import { courseColor } from "@/lib/colors";
import { matchesSearch, pluralize } from "@/lib/text";
import { formatDuration } from "@/lib/time";
import type { Course } from "@/types/entities";

export const Route = createFileRoute("/courses/")({
  component: CoursesPage,
});

function CoursesPage() {
  useDocumentTitle("Cursos");

  const [search, setSearch] = useState("");
  const { courses, allocations, isLoading, error, refetch } = useAcademicData();
  const formDrawer = useOverlay<Course>();
  const deleteDialog = useOverlay<Course>();

  const allocationsByCourse = useMemo(
    () => groupBy(allocations, (allocation) => allocation.courseId),
    [allocations],
  );

  const rows = courses.filter((course) => matchesSearch(course.name, search));

  const columns: Column<Course>[] = [
    {
      key: "name",
      header: "Curso",
      cell: (course) => (
        <HStack spacing="3">
          <Box
            boxSize="2.5"
            rounded="full"
            flexShrink={0}
            bg={`${courseColor(course.id)}.400`}
          />
          <RouterLink
            to="/courses/$courseId"
            params={{ courseId: course.id }}
            fontWeight="semibold"
          >
            {course.name}
          </RouterLink>
        </HStack>
      ),
    },
    {
      key: "allocations",
      header: "Aulas na semana",
      cell: (course) => {
        const items = allocationsByCourse.get(course.id) ?? [];

        return items.length > 0 ? (
          <Badge colorScheme="brand" variant="subtle">
            {pluralize(items.length, "aula", "aulas")} ·{" "}
            {formatDuration(totalMinutes(items))}
          </Badge>
        ) : (
          <Badge colorScheme="gray" variant="subtle">
            Sem aulas
          </Badge>
        );
      },
    },
    {
      key: "professors",
      header: "Professores",
      hideBelow: "md",
      cell: (course) => {
        const items = allocationsByCourse.get(course.id) ?? [];
        const professorCount = new Set(items.map((item) => item.professorId))
          .size;

        return (
          <Text fontSize="sm" color="fg.muted">
            {pluralize(professorCount, "professor", "professores")}
          </Text>
        );
      },
    },
    {
      key: "actions",
      header: "Ações",
      isNumeric: true,
      cell: (course) => (
        <RowActions
          label={course.name}
          onEdit={() => formDrawer.open(course)}
          onDelete={() => deleteDialog.open(course)}
        >
          <Tooltip label="Ver detalhes" hasArrow openDelay={300}>
            <IconButtonLink
              to="/courses/$courseId"
              params={{ courseId: course.id }}
              aria-label={`Ver detalhes de ${course.name}`}
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

  const newCourseButton = (
    <Button
      leftIcon={<Icon as={Plus} boxSize="4" />}
      onClick={() => formDrawer.open()}
    >
      Novo curso
    </Button>
  );

  return (
    <PageContainer>
      <PageHeader
        icon={BookOpen}
        title="Cursos"
        description="Catálogo de cursos que recebem professores na grade semanal."
        actions={newCourseButton}
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
          placeholder="Buscar curso"
        />
        {!isLoading && !error && (
          <Text fontSize="sm" color="fg.muted">
            {rows.length} de {pluralize(courses.length, "curso", "cursos")}
          </Text>
        )}
      </Flex>

      {error ? (
        <QueryErrorState error={error} onRetry={refetch} />
      ) : (
        <DataTable
          label="Lista de cursos"
          columns={columns}
          rows={rows}
          getRowId={(course) => course.id}
          isLoading={isLoading}
          emptyState={
            search ? (
              <EmptyState
                icon={SearchX}
                title="Nenhum curso encontrado"
                description={`Nenhum curso corresponde a "${search}".`}
                action={
                  <Button variant="ghost" onClick={() => setSearch("")}>
                    Limpar busca
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={BookOpen}
                title="Nenhum curso cadastrado"
                description="Cadastre o primeiro curso para poder alocar professores."
                action={newCourseButton}
              />
            )
          }
        />
      )}

      <CourseFormDrawer
        isOpen={formDrawer.isOpen}
        onClose={formDrawer.close}
        course={formDrawer.data}
        formKey={formDrawer.key}
      />
      <DeleteCourseDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        course={deleteDialog.data}
      />
    </PageContainer>
  );
}
