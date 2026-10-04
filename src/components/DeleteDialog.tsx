import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  Button,
  Icon,
  Text,
} from "@chakra-ui/react";
import { Trash2 } from "lucide-react";
import { useRef, type ReactNode } from "react";

type DeleteDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  /** Quando informado, explica por que a exclusão não é permitida. */
  blockedReason?: string | null;
  isDeleting?: boolean;
};

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  blockedReason,
  isDeleting = false,
}: DeleteDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      isCentered
      motionPreset="slideInBottom"
    >
      <AlertDialogOverlay>
        <AlertDialogContent mx="4" bg="bg.surface">
          <AlertDialogHeader fontSize="lg">{title}</AlertDialogHeader>

          <AlertDialogBody>
            {blockedReason ? (
              <Alert status="warning" rounded="md" alignItems="flex-start">
                <AlertIcon />
                <Text fontSize="sm">{blockedReason}</Text>
              </Alert>
            ) : (
              <Text color="fg.muted">{description}</Text>
            )}
          </AlertDialogBody>

          <AlertDialogFooter gap="3">
            <Button
              ref={cancelRef}
              variant="ghost"
              colorScheme="gray"
              onClick={onClose}
            >
              {blockedReason ? "Entendi" : "Cancelar"}
            </Button>

            {!blockedReason && (
              <Button
                colorScheme="red"
                leftIcon={<Icon as={Trash2} boxSize="4" />}
                isLoading={isDeleting}
                loadingText="Excluindo"
                onClick={onConfirm}
              >
                Excluir
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
