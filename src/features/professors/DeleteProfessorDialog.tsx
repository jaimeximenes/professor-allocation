import { useToast } from "@chakra-ui/react";
import { getErrorMessage } from "@/api/errors";
import { allocationsApi, professorsApi } from "@/api/queries";
import { DeleteDialog } from "@/components/DeleteDialog";
import { pluralize } from "@/lib/text";
import type { Professor } from "@/types/entities";

type DeleteProfessorDialogProps = {
  professor: Professor | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
};

export function DeleteProfessorDialog({
  professor,
  isOpen,
  onClose,
  onDeleted,
}: DeleteProfessorDialogProps) {
  const toast = useToast();
  const { data: allocations = [] } = allocationsApi.useList();
  const removeProfessor = professorsApi.useRemove();

  // allocation.professor_id é chave estrangeira obrigatória no banco.
  const linkedAllocations = professor
    ? allocations.filter(
        (allocation) => allocation.professorId === professor.id,
      ).length
    : 0;

  async function handleConfirm() {
    if (!professor) {
      return;
    }

    try {
      await removeProfessor.mutateAsync(professor.id);
      toast({
        status: "success",
        title: "Professor excluído",
        description: professor.name,
      });
      onClose();
      onDeleted?.();
    } catch (error) {
      toast({
        status: "error",
        title: "Não foi possível excluir o professor",
        description: getErrorMessage(error),
      });
    }
  }

  return (
    <DeleteDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      isDeleting={removeProfessor.isPending}
      title="Excluir professor"
      description={
        <>
          Tem certeza de que deseja excluir <strong>{professor?.name}</strong>?
          Essa ação não pode ser desfeita.
        </>
      }
      blockedReason={
        linkedAllocations > 0
          ? `${professor?.name} tem ${pluralize(linkedAllocations, "alocação", "alocações")} na grade. Exclua essas alocações antes de excluir o professor.`
          : null
      }
    />
  );
}
