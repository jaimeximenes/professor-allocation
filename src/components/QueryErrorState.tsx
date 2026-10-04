import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Code,
  Icon,
  Text,
} from "@chakra-ui/react";
import { RefreshCw } from "lucide-react";
import { ApiError, getErrorMessage } from "@/api/errors";

type QueryErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
  title?: string;
};

export function QueryErrorState({
  error,
  onRetry,
  title = "Não foi possível carregar os dados",
}: QueryErrorStateProps) {
  const isConnectionError = error instanceof ApiError && error.status === 0;

  return (
    <Alert
      status="error"
      variant="left-accent"
      rounded="lg"
      alignItems="flex-start"
      py="4"
    >
      <AlertIcon mt="0.5" />
      <Box flex="1">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription display="block" fontSize="sm">
          <Text>{getErrorMessage(error)}</Text>
          {isConnectionError && (
            <Text mt="1">
              Verifique se a API está em execução. Para a API simulada, rode{" "}
              <Code fontSize="xs">npm run dev</Code> (json-server e site
              juntos); para o backend Spring Boot, inicie o projeto do backend
              antes de usar <Code fontSize="xs">npm run dev:backend</Code>.
            </Text>
          )}
        </AlertDescription>

        {onRetry && (
          <Button
            mt="3"
            size="sm"
            variant="outline"
            colorScheme="red"
            leftIcon={<Icon as={RefreshCw} boxSize="4" />}
            onClick={onRetry}
          >
            Tentar novamente
          </Button>
        )}
      </Box>
    </Alert>
  );
}
