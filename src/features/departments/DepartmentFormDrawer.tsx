import {
  DrawerBody,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage } from "@/api/errors";
import { departmentsApi } from "@/api/queries";
import { FormDrawer, FormDrawerFooter } from "@/components/FormDrawer";
import { isNameTaken } from "@/lib/text";
import type { Department } from "@/types/entities";

const FORM_ID = "department-form";

type DepartmentFormValues = { name: string };

type DepartmentFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Departamento em edição; null para cadastrar um novo. */
  department: Department | null;
  /** Muda a cada abertura para recriar o formulário com valores limpos. */
  formKey: number;
};

export function DepartmentFormDrawer({
  isOpen,
  onClose,
  department,
  formKey,
}: DepartmentFormDrawerProps) {
  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={department ? "Editar departamento" : "Novo departamento"}
      description="Departamentos agrupam os professores da instituição."
    >
      <DepartmentForm key={formKey} department={department} onClose={onClose} />
    </FormDrawer>
  );
}

function DepartmentForm({
  department,
  onClose,
}: {
  department: Department | null;
  onClose: () => void;
}) {
  const toast = useToast();
  const { data: departments = [] } = departmentsApi.useList();
  const saveDepartment = departmentsApi.useSave();

  // Mesmas regras do DepartmentDTO (@NotBlank, @Size(max = 100)) + nome único.
  const schema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, "O nome do departamento é obrigatório.")
          .max(100, "O nome do departamento deve ter no máximo 100 caracteres.")
          .refine(
            (name) => !isNameTaken(departments, name, department?.id),
            "Já existe um departamento com esse nome.",
          ),
      }),
    [departments, department],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: department?.name ?? "" },
  });

  const onSubmit = handleSubmit(async ({ name }) => {
    try {
      await saveDepartment.mutateAsync({ id: department?.id, data: { name } });
      toast({
        status: "success",
        title: department
          ? "Departamento atualizado"
          : "Departamento cadastrado",
        description: name,
      });
      onClose();
    } catch (error) {
      toast({
        status: "error",
        title: "Não foi possível salvar o departamento",
        description: getErrorMessage(error),
      });
    }
  });

  return (
    <>
      <DrawerBody py="6">
        <form id={FORM_ID} onSubmit={onSubmit} noValidate>
          <FormControl isInvalid={Boolean(errors.name)} isRequired>
            <FormLabel>Nome</FormLabel>
            <Input
              {...register("name")}
              placeholder="Ex.: Computação e Tecnologia"
              autoComplete="off"
            />
            {errors.name ? (
              <FormErrorMessage>{errors.name.message}</FormErrorMessage>
            ) : (
              <FormHelperText>
                Até 100 caracteres. Não pode repetir.
              </FormHelperText>
            )}
          </FormControl>
        </form>
      </DrawerBody>

      <FormDrawerFooter
        formId={FORM_ID}
        onCancel={onClose}
        isSubmitting={saveDepartment.isPending}
      />
    </>
  );
}
