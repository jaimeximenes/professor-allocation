import { SimpleGrid, Skeleton, Stack } from "@chakra-ui/react";
import { FileQuestion } from "lucide-react";
import { isNotFoundError } from "@/api/errors";
import { EmptyState } from "./EmptyState";
import { ButtonLink } from "./links";
import { PageContainer } from "./PageHeader";
import { QueryErrorState } from "./QueryErrorState";

export function DetailPageSkeleton() {
  return (
    <PageContainer>
      <Stack spacing="8">
        <Skeleton h="4" w="40" rounded="md" />
        <Skeleton h="10" w={{ base: "full", md: "md" }} rounded="md" />
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} h="24" rounded="xl" />
          ))}
        </SimpleGrid>
        <Skeleton h="64" rounded="xl" />
      </Stack>
    </PageContainer>
  );
}

type DetailPageErrorProps = {
  error: unknown;
  onRetry: () => void;
  notFoundTitle: string;
  backTo: "/professors" | "/courses" | "/departments";
  backLabel: string;
};

/** Erro ao carregar um registro: "não encontrado" (404) ou falha da API. */
export function DetailPageError({
  error,
  onRetry,
  notFoundTitle,
  backTo,
  backLabel,
}: DetailPageErrorProps) {
  return (
    <PageContainer>
      {isNotFoundError(error) ? (
        <EmptyState
          icon={FileQuestion}
          title={notFoundTitle}
          description="O registro pode ter sido excluído ou o endereço está incorreto."
          action={<ButtonLink to={backTo}>{backLabel}</ButtonLink>}
        />
      ) : (
        <QueryErrorState error={error} onRetry={onRetry} />
      )}
    </PageContainer>
  );
}
