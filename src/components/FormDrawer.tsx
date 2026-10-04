import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Text,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

type FormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Formulário que renderiza o DrawerBody e o FormDrawerFooter. */
  children: ReactNode;
};

/** Painel lateral usado pelos formulários de cadastro e edição. */
export function FormDrawer({
  isOpen,
  onClose,
  title,
  description,
  children,
}: FormDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent bg="bg.surface">
        <DrawerHeader
          borderBottomWidth="1px"
          borderColor="border.subtle"
          pr="12"
        >
          <Text>{title}</Text>
          {description && (
            <Text mt="1" fontSize="sm" fontWeight="normal" color="fg.muted">
              {description}
            </Text>
          )}
        </DrawerHeader>

        {children}

        {/* Fica depois do formulário para que o foco inicial vá para o primeiro campo. */}
        <DrawerCloseButton top="4" />
      </DrawerContent>
    </Drawer>
  );
}

type FormDrawerFooterProps = {
  formId: string;
  onCancel: () => void;
  isSubmitting: boolean;
  isDisabled?: boolean;
  submitLabel?: string;
};

export function FormDrawerFooter({
  formId,
  onCancel,
  isSubmitting,
  isDisabled = false,
  submitLabel = "Salvar",
}: FormDrawerFooterProps) {
  return (
    <DrawerFooter borderTopWidth="1px" borderColor="border.subtle" gap="3">
      <Button variant="ghost" colorScheme="gray" onClick={onCancel}>
        Cancelar
      </Button>
      <Button
        type="submit"
        form={formId}
        isLoading={isSubmitting}
        isDisabled={isDisabled}
        loadingText="Salvando"
      >
        {submitLabel}
      </Button>
    </DrawerFooter>
  );
}
