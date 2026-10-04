import { Box, HStack, Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

type RowActionsProps = {
  /** Nome do registro, usado nos rótulos acessíveis dos botões. */
  label: string;
  onEdit: () => void;
  onDelete: () => void;
  /**
   * Ações extras exibidas antes de editar/excluir (ex.: link de detalhes).
   * Ficam ocultas no celular, onde o nome do registro já é o link.
   */
  children?: ReactNode;
};

export function RowActions({
  label,
  onEdit,
  onDelete,
  children,
}: RowActionsProps) {
  return (
    <HStack spacing="1" justify="flex-end">
      {children && (
        <Box display={{ base: "none", sm: "block" }}>{children}</Box>
      )}

      <Tooltip label="Editar" hasArrow openDelay={300}>
        <IconButton
          aria-label={`Editar ${label}`}
          icon={<Icon as={Pencil} boxSize="4" />}
          size="sm"
          variant="ghost"
          colorScheme="gray"
          onClick={onEdit}
        />
      </Tooltip>

      <Tooltip label="Excluir" hasArrow openDelay={300}>
        <IconButton
          aria-label={`Excluir ${label}`}
          icon={<Icon as={Trash2} boxSize="4" />}
          size="sm"
          variant="ghost"
          colorScheme="red"
          onClick={onDelete}
        />
      </Tooltip>
    </HStack>
  );
}
