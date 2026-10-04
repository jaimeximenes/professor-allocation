import { useToast } from "@chakra-ui/react";
import { getErrorMessage } from "@/api/errors";
import { allocationsApi, coursesApi } from "@/api/queries";
import { DeleteDialog } from "@/components/DeleteDialog";
import { pluralize } from "@/lib/text";
import type { Course } from "@/types/entities";

type DeleteCourseDialogProps = {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
};

export function DeleteCourseDialog({
  course,
  isOpen,
  onClose,
  onDeleted,
}: DeleteCourseDialogProps) {
  const toast = useToast();
  const { data: allocations = [] } = allocationsApi.useList();
  const removeCourse = coursesApi.useRemove();

  // allocation.course_id é chave estrangeira obrigatória no banco.
  const linkedAllocations = course
    ? allocations.filter((allocation) => allocation.courseId === course.id)
        .length
    : 0;

  async function handleConfirm() {
    if (!course) {
      return;
    }

    try {
      await removeCourse.mutateAsync(course.id);
      toast({
        status: "success",
        title: "Curso excluído",
        description: course.name,
      });
      onClose();
      onDeleted?.();
    } catch (error) {
      toast({
        status: "error",
        title: "Não foi possível excluir o curso",
        description: getErrorMessage(error),
      });
    }
  }

  return (
    <DeleteDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      isDeleting={removeCourse.isPending}
      title="Excluir curso"
      description={
        <>
          Tem certeza de que deseja excluir o curso{" "}
          <strong>{course?.name}</strong>? Essa ação não pode ser desfeita.
        </>
      }
      blockedReason={
        linkedAllocations > 0
          ? `"${course?.name}" tem ${pluralize(linkedAllocations, "alocação", "alocações")} na grade. Exclua essas alocações antes de excluir o curso.`
          : null
      }
    />
  );
}
