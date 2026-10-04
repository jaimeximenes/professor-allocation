import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({
  icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Flex
      direction="column"
      align="center"
      textAlign="center"
      py="14"
      px="6"
      bg="bg.surface"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="border.subtle"
      rounded="xl"
    >
      <Flex
        boxSize="12"
        align="center"
        justify="center"
        rounded="full"
        bg="bg.accent"
        color="fg.accent"
      >
        <Icon as={icon} boxSize="6" />
      </Flex>

      <Text mt="4" fontWeight="semibold" fontSize="md">
        {title}
      </Text>

      {description && (
        <Text mt="2" maxW="md" fontSize="sm" color="fg.muted">
          {description}
        </Text>
      )}

      {action && <Box mt="6">{action}</Box>}
    </Flex>
  );
}
