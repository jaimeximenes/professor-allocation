import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { buildAllocationViews } from "@/lib/allocations";
import { indexById } from "@/lib/collections";
import { byName } from "@/lib/text";
import type {
  Allocation,
  Course,
  Department,
  EntityInput,
  ID,
  Professor,
} from "@/types/entities";
import { api } from "./client";
import type { Collection } from "./types";

/**
 * Cria os hooks de leitura e escrita de um recurso REST com o TanStack Query.
 * A lista fica em cache na chave [recurso] e cada registro em [recurso, id];
 * depois de salvar ou excluir, o cache do recurso é invalidado e as telas
 * são atualizadas automaticamente.
 */
function createResourceHooks<T extends { id: ID }>(collection: Collection) {
  return {
    useList() {
      return useQuery({
        queryKey: [collection],
        queryFn: () => api.list<T>(collection),
      });
    },

    useOne(id: ID) {
      return useQuery({
        queryKey: [collection, id],
        queryFn: () => api.get<T>(collection, id),
      });
    },

    /** POST quando não há id (criação) e PUT quando há (edição). */
    useSave() {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: ({ id, data }: { id?: ID; data: EntityInput<T> }) =>
          id
            ? api.update<T>(collection, id, data)
            : api.create<T>(collection, data),
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: [collection] }),
      });
    },

    useRemove() {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: (id: ID) => api.remove(collection, id),
        onSuccess: (_result, id) => {
          // A página de detalhe do registro excluído não deve buscá-lo de novo.
          queryClient.removeQueries({
            queryKey: [collection, id],
            exact: true,
          });
          void queryClient.invalidateQueries({ queryKey: [collection] });
        },
      });
    },
  };
}

export const departmentsApi = createResourceHooks<Department>("departments");
export const coursesApi = createResourceHooks<Course>("courses");
export const professorsApi = createResourceHooks<Professor>("professors");
export const allocationsApi = createResourceHooks<Allocation>("allocations");

/**
 * Carrega os quatro recursos e monta os relacionamentos no cliente
 * (equivalente aos @ManyToOne do backend): mapas por id e as alocações já
 * com professor, curso e departamento resolvidos.
 */
export function useAcademicData() {
  const departmentsQuery = departmentsApi.useList();
  const coursesQuery = coursesApi.useList();
  const professorsQuery = professorsApi.useList();
  const allocationsQuery = allocationsApi.useList();

  const data = useMemo(() => {
    const departments = [...(departmentsQuery.data ?? [])].sort(byName);
    const courses = [...(coursesQuery.data ?? [])].sort(byName);
    const professors = [...(professorsQuery.data ?? [])].sort(byName);
    const allocations = allocationsQuery.data ?? [];

    const lookup = {
      departmentsById: indexById(departments),
      coursesById: indexById(courses),
      professorsById: indexById(professors),
    };

    return {
      departments,
      courses,
      professors,
      allocations,
      allocationViews: buildAllocationViews(allocations, lookup),
      ...lookup,
    };
  }, [
    departmentsQuery.data,
    coursesQuery.data,
    professorsQuery.data,
    allocationsQuery.data,
  ]);

  const queries = [
    departmentsQuery,
    coursesQuery,
    professorsQuery,
    allocationsQuery,
  ];

  return {
    ...data,
    isLoading: queries.some((query) => query.isPending),
    error: queries.find((query) => query.error)?.error ?? null,
    refetch: () => {
      for (const query of queries) {
        void query.refetch();
      }
    },
  };
}
