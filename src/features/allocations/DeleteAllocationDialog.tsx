import { useToast } from "@chakra-ui/react";
import { getErrorMessage } from "@/api/errors";
import { allocationsApi } from "@/api/queries";
import { DeleteDialog } from "@/components/DeleteDialog";
import type { AllocationView } from "@/lib/allocations";
import { DAY_LABELS } from "@/lib/days";
import { formatHour } from "@/lib/time";

type DeleteAllocationDialogProps = {
  allocation: AllocationView | null;
  isOpen: boolean;
  onClose: () => void;
};

export function DeleteAllocationDialog({
  allocation,
  isOpen,
  onClose,
}: DeleteAllocationDialogProps) {
  const toast = useToast();
  const removeAllocation = allocationsApi.useRemove();

  const summary = allocation
    ? `${allocation.course?.name ?? "Curso removido"} · ${
        DAY_LABELS[allocation.dayOfWeek].long
      }, ${formatHour(allocation.startHour)}–${formatHour(allocation.endHour)}`
    : "";

  async function handleConfirm() {
    if (!allocation) {
      return;
    }

    try {
      await removeAllocation.mutateAsync(allocation.id);
      toast({
        status: "success",
        title: "Alocação excluída",
        description: summary,
      });
      onClose();
    } catch (error) {
      toast({
        status: "error",
        title: "Não foi possível excluir a alocação",
        description: getErrorMessage(error),
      });
    }
  }

  return (
    <DeleteDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      isDeleting={removeAllocation.isPending}
      title="Excluir alocação"
      description={
        <>
          Tem certeza de que deseja excluir a aula <strong>{summary}</strong>
          {allocation?.professor ? ` de ${allocation.professor.name}` : ""}?
          Essa ação não pode ser desfeita.
        </>
      }
    />
  );
}
