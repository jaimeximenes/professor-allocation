import { useToast } from "@chakra-ui/react";
import { getErrorMessage } from "@/api/errors";
import { departmentsApi, professorsApi } from "@/api/queries";
import { DeleteDialog } from "@/components/DeleteDialog";
import { pluralize } from "@/lib/text";
import type { Department } from "@/types/entities";

type DeleteDepartmentDialogProps = {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
};

export function DeleteDepartmentDialog({
  department,
  isOpen,
  onClose,
  onDeleted,
}: DeleteDepartmentDialogProps) {
  const toast = useToast();
  const { data: professors = [] } = professorsApi.useList();
  const removeDepartment = departmentsApi.useRemove();

  // No banco, professor.department_id é chave estrangeira obrigatória:
  // não dá para excluir um departamento que ainda tem professores.
  const linkedProfessors = department
    ? professors.filter((professor) => professor.departmentId === department.id)
        .length
    : 0;

  async function handleConfirm() {
    if (!department) {
      return;
    }

    try {
      await removeDepartment.mutateAsync(department.id);
      toast({
        status: "success",
        title: "Departamento excluído",
        description: department.name,
      });
      onClose();
      onDeleted?.();
    } catch (error) {
      toast({
        status: "error",
        title: "Não foi possível excluir o departamento",
        description: getErrorMessage(error),
      });
    }
  }

  return (
    <DeleteDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      isDeleting={removeDepartment.isPending}
      title="Excluir departamento"
      description={
        <>
          Tem certeza de que deseja excluir o departamento{" "}
          <strong>{department?.name}</strong>? Essa ação não pode ser desfeita.
        </>
      }
      blockedReason={
        linkedProfessors > 0
          ? `"${department?.name}" tem ${pluralize(linkedProfessors, "professor vinculado", "professores vinculados")}. Transfira ou exclua esses professores antes de excluir o departamento.`
          : null
      }
    />
  );
}
