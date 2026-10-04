import {
  Box,
  Button,
  Flex,
  Icon,
  SkipNavContent,
  SkipNavLink,
} from "@chakra-ui/react";
import {
  Outlet,
  createRootRoute,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { FileQuestion, House, RefreshCw, TriangleAlert } from "lucide-react";
import { getErrorMessage } from "@/api/errors";
import { EmptyState } from "@/components/EmptyState";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { ButtonLink } from "@/components/links";
import { PageContainer } from "@/components/PageHeader";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: RootErrorPage,
});

function RootLayout() {
  return (
    <Flex direction="column" minH="100vh">
      <SkipNavLink>Pular para o conteúdo</SkipNavLink>
      <AppHeader />
      <SkipNavContent />
      <Box as="main" flex="1">
        <Outlet />
      </Box>
      <AppFooter />
    </Flex>
  );
}

function NotFoundPage() {
  useDocumentTitle("Página não encontrada");

  return (
    <PageContainer>
      <EmptyState
        icon={FileQuestion}
        title="Página não encontrada"
        description="O endereço acessado não existe ou foi removido."
        action={
          <ButtonLink to="/" leftIcon={<Icon as={House} boxSize="4" />}>
            Voltar ao início
          </ButtonLink>
        }
      />
    </PageContainer>
  );
}

function RootErrorPage({ error, reset }: ErrorComponentProps) {
  return (
    <PageContainer>
      <EmptyState
        icon={TriangleAlert}
        title="Algo deu errado"
        description={getErrorMessage(error)}
        action={
          <Button
            leftIcon={<Icon as={RefreshCw} boxSize="4" />}
            onClick={reset}
          >
            Tentar novamente
          </Button>
        }
      />
    </PageContainer>
  );
}
