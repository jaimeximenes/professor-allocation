import { Box, Flex, HStack, Icon, Skeleton, Text } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  helpText?: ReactNode;
  isLoading?: boolean;
};

export function StatCard({
  label,
  value,
  icon,
  helpText,
  isLoading = false,
}: StatCardProps) {
  return (
    <HStack
      spacing="4"
      p="5"
      h="full"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.subtle"
      rounded="xl"
      shadow="sm"
    >
      <Flex
        boxSize="11"
        flexShrink={0}
        align="center"
        justify="center"
        rounded="lg"
        bg="bg.accent"
        color="fg.accent"
      >
        <Icon as={icon} boxSize="5" />
      </Flex>

      <Box minW="0">
        <Text fontSize="sm" color="fg.muted">
          {label}
        </Text>
        <Skeleton isLoaded={!isLoading} rounded="md" minW="10">
          <Text fontSize="2xl" fontWeight="bold" lineHeight="short">
            {value}
          </Text>
        </Skeleton>
        {helpText && (
          <Text mt="0.5" fontSize="xs" color="fg.muted">
            {helpText}
          </Text>
        )}
      </Box>
    </HStack>
  );
}
