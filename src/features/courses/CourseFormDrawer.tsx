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
import { coursesApi } from "@/api/queries";
import { FormDrawer, FormDrawerFooter } from "@/components/FormDrawer";
import { isNameTaken } from "@/lib/text";
import type { Course } from "@/types/entities";

const FORM_ID = "course-form";

type CourseFormValues = { name: string };

type CourseFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Curso em edição; null para cadastrar um novo. */
  course: Course | null;
  /** Muda a cada abertura para recriar o formulário com valores limpos. */
  formKey: number;
};

export function CourseFormDrawer({
  isOpen,
  onClose,
  course,
  formKey,
}: CourseFormDrawerProps) {
  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={course ? "Editar curso" : "Novo curso"}
      description="Os cursos recebem as alocações de professores na grade semanal."
    >
      <CourseForm key={formKey} course={course} onClose={onClose} />
    </FormDrawer>
  );
}

function CourseForm({
  course,
  onClose,
}: {
  course: Course | null;
  onClose: () => void;
}) {
  const toast = useToast();
  const { data: courses = [] } = coursesApi.useList();
  const saveCourse = coursesApi.useSave();

  // Mesmas regras do CourseDTO (@NotBlank, @Size(max = 100)) + nome único.
  const schema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, "O nome do curso é obrigatório.")
          .max(100, "O nome do curso deve ter no máximo 100 caracteres.")
          .refine(
            (name) => !isNameTaken(courses, name, course?.id),
            "Já existe um curso com esse nome.",
          ),
      }),
    [courses, course],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: course?.name ?? "" },
  });

  const onSubmit = handleSubmit(async ({ name }) => {
    try {
      await saveCourse.mutateAsync({ id: course?.id, data: { name } });
      toast({
        status: "success",
        title: course ? "Curso atualizado" : "Curso cadastrado",
        description: name,
      });
      onClose();
    } catch (error) {
      toast({
        status: "error",
        title: "Não foi possível salvar o curso",
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
              placeholder="Ex.: Desenvolvimento Frontend"
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
        isSubmitting={saveCourse.isPending}
      />
    </>
  );
}
