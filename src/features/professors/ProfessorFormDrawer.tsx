import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  DrawerBody,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage } from "@/api/errors";
import { departmentsApi, professorsApi } from "@/api/queries";
import { FormDrawer, FormDrawerFooter } from "@/components/FormDrawer";
import { ButtonLink } from "@/components/links";
import { formatCpf, isCpfFormatValid, onlyDigits } from "@/lib/cpf";
import { byName } from "@/lib/text";
import type { ID, Professor } from "@/types/entities";

const FORM_ID = "professor-form";

type ProfessorFormValues = {
  name: string;
  cpf: string;
  departmentId: string;
};

export type ProfessorDrawerData = {
  /** Professor em edição; ausente ao cadastrar um novo. */
  professor?: Professor;
  /** Departamento já selecionado ao cadastrar (ex.: a partir da página do departamento). */
  departmentId?: ID;
};

type ProfessorFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  data: ProfessorDrawerData | null;
  /** Muda a cada abertura para recriar o formulário com valores limpos. */
  formKey: number;
};

export function ProfessorFormDrawer({
  isOpen,
  onClose,
  data,
  formKey,
}: ProfessorFormDrawerProps) {
  const professor = data?.professor ?? null;

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={professor ? "Editar professor" : "Novo professor"}
      description="Todo professor pertence a um departamento e pode ser alocado em cursos."
    >
      <ProfessorForm
        key={formKey}
        professor={professor}
        initialDepartmentId={data?.departmentId}
        onClose={onClose}
      />
    </FormDrawer>
  );
}

type ProfessorFormProps = {
  professor: Professor | null;
  initialDepartmentId?: ID;
  onClose: () => void;
};

function ProfessorForm({
  professor,
  initialDepartmentId,
  onClose,
}: ProfessorFormProps) {
  const toast = useToast();
  const { data: professors = [] } = professorsApi.useList();
  const departmentsQuery = departmentsApi.useList();
  const saveProfessor = professorsApi.useSave();

  const departments = useMemo(
    () => [...(departmentsQuery.data ?? [])].sort(byName),
    [departmentsQuery.data],
  );
  const hasNoDepartments =
    departmentsQuery.isSuccess && departments.length === 0;

  // Mesmas regras do ProfessorDTO: @NotBlank/@Size(max = 100) no nome,
  // @Pattern("\\d{11}") no CPF (único no banco) e @NotNull no departamento.
  const schema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, "O nome do professor é obrigatório.")
          .max(100, "O nome do professor deve ter no máximo 100 caracteres."),
        cpf: z
          .string()
          .refine(
            (cpf) => isCpfFormatValid(onlyDigits(cpf)),
            "O CPF deve conter exatamente 11 dígitos numéricos.",
          )
          .refine(
            (cpf) =>
              !professors.some(
                (item) =>
                  item.id !== professor?.id && item.cpf === onlyDigits(cpf),
              ),
            "Já existe um professor cadastrado com esse CPF.",
          ),
        departmentId: z.string().min(1, "O departamento é obrigatório."),
      }),
    [professors, professor],
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfessorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: professor?.name ?? "",
      cpf: formatCpf(professor?.cpf ?? ""),
      departmentId: professor?.departmentId ?? initialDepartmentId ?? "",
    },
  });

  const cpfField = register("cpf");

  const onSubmit = handleSubmit(async (values) => {
    const data = {
      name: values.name,
      cpf: onlyDigits(values.cpf), // o backend espera só os 11 dígitos
      departmentId: values.departmentId,
    };

    try {
      await saveProfessor.mutateAsync({ id: professor?.id, data });
      toast({
        status: "success",
        title: professor ? "Professor atualizado" : "Professor cadastrado",
        description: data.name,
      });
      onClose();
    } catch (error) {
      toast({
        status: "error",
        title: "Não foi possível salvar o professor",
        description: getErrorMessage(error),
      });
    }
  });

  return (
    <>
      <DrawerBody py="6">
        <form id={FORM_ID} onSubmit={onSubmit} noValidate>
          <Stack spacing="5">
            {hasNoDepartments && (
              <Alert status="warning" rounded="md" alignItems="flex-start">
                <AlertIcon />
                <Box>
                  <AlertDescription fontSize="sm">
                    Nenhum departamento cadastrado. Cadastre um departamento
                    antes de cadastrar professores.
                  </AlertDescription>
                  <ButtonLink
                    to="/departments"
                    size="sm"
                    mt="3"
                    variant="outline"
                  >
                    Ir para departamentos
                  </ButtonLink>
                </Box>
              </Alert>
            )}

            <FormControl isInvalid={Boolean(errors.name)} isRequired>
              <FormLabel>Nome</FormLabel>
              <Input
                {...register("name")}
                placeholder="Ex.: Ana Beatriz Cavalcanti"
                autoComplete="off"
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.cpf)} isRequired>
              <FormLabel>CPF</FormLabel>
              <Input
                {...cpfField}
                onChange={(event) => {
                  event.target.value = formatCpf(event.target.value);
                  void cpfField.onChange(event);
                }}
                inputMode="numeric"
                placeholder="000.000.000-00"
                maxLength={14}
                autoComplete="off"
              />
              {errors.cpf ? (
                <FormErrorMessage>{errors.cpf.message}</FormErrorMessage>
              ) : (
                <FormHelperText>
                  11 dígitos. A máscara é aplicada automaticamente.
                </FormHelperText>
              )}
            </FormControl>

            <FormControl isInvalid={Boolean(errors.departmentId)} isRequired>
              <FormLabel>Departamento</FormLabel>
              <Controller
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder={
                      departmentsQuery.isPending
                        ? "Carregando departamentos..."
                        : "Selecione o departamento"
                    }
                  >
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
              <FormErrorMessage>
                {errors.departmentId?.message}
              </FormErrorMessage>
            </FormControl>
          </Stack>
        </form>
      </DrawerBody>

      <FormDrawerFooter
        formId={FORM_ID}
        onCancel={onClose}
        isSubmitting={saveProfessor.isPending}
        isDisabled={hasNoDepartments}
      />
    </>
  );
}
