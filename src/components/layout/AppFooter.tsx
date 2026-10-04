import {
  Badge,
  Box,
  Button,
  Code,
  Container,
  Divider,
  Flex,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { API_URL, isDemoMode } from "@/api/config";
import { resetLocalDatabase } from "@/api/local-driver";
import { RouterLink } from "../links";
import { Logo } from "./Logo";
import { NAV_ITEMS } from "./navigation";

export function AppFooter() {
  return (
    <Box
      as="footer"
      bg="bg.surface"
      borderTopWidth="1px"
      borderColor="border.subtle"
    >
      <Container maxW="7xl" py="10">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing="8">
          <Stack spacing="3">
            <Logo />
            <Text fontSize="sm" color="fg.muted" maxW="xs">
              Interface web do sistema Professor Allocation, desenvolvida para a
              disciplina de Frontend da Fafire.
            </Text>
          </Stack>

          <Stack spacing="2" align="flex-start">
            <FooterTitle>Navegação</FooterTitle>
            {NAV_ITEMS.map((item) => (
              <RouterLink
                key={item.to}
                to={item.to}
                fontSize="sm"
                color="fg.muted"
                _hover={{ color: "fg.accent", textDecoration: "none" }}
              >
                {item.label}
              </RouterLink>
            ))}
          </Stack>

          <Stack spacing="2" align="flex-start">
            <FooterTitle>Fonte de dados</FooterTitle>
            <DataSourceInfo />
          </Stack>
        </SimpleGrid>

        <Divider my="6" borderColor="border.subtle" />

        <Flex
          justify="space-between"
          gap="2"
          wrap="wrap"
          fontSize="sm"
          color="fg.muted"
        >
          <Text>
            © {new Date().getFullYear()} Professor Allocation · Projeto
            acadêmico.
          </Text>
          <Text>Desenvolvido por Jaime Ximenes.</Text>
        </Flex>
      </Container>
    </Box>
  );
}

function FooterTitle({ children }: { children: string }) {
  return (
    <Text
      fontSize="xs"
      fontWeight="semibold"
      textTransform="uppercase"
      letterSpacing="wider"
    >
      {children}
    </Text>
  );
}

function DataSourceInfo() {
  const queryClient = useQueryClient();
  const toast = useToast();

  if (!isDemoMode) {
    return (
      <>
        <Badge colorScheme="green">API REST</Badge>
        <Text fontSize="sm" color="fg.muted">
          Conectado a <Code fontSize="xs">{API_URL}</Code>
        </Text>
      </>
    );
  }

  function handleReset() {
    resetLocalDatabase();
    void queryClient.invalidateQueries();
    toast({
      status: "success",
      title: "Dados de exemplo restaurados",
    });
  }

  return (
    <>
      <Badge colorScheme="purple">Modo demonstração</Badge>
      <Text fontSize="sm" color="fg.muted">
        Os dados ficam salvos neste navegador (localStorage).
      </Text>
      <Button
        size="xs"
        variant="outline"
        leftIcon={<Icon as={RotateCcw} boxSize="3.5" />}
        onClick={handleReset}
      >
        Restaurar dados de exemplo
      </Button>
    </>
  );
}
