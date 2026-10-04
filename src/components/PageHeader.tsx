import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Container,
  Flex,
  HStack,
  Heading,
  Icon,
  Stack,
  Text,
  type ContainerProps,
} from "@chakra-ui/react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { RouterLink } from "./links";

export function PageContainer(props: ContainerProps) {
  return <Container maxW="7xl" py={{ base: 6, md: 10 }} {...props} />;
}

type SectionHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function SectionHeader({
  title,
  description,
  actions,
}: SectionHeaderProps) {
  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      align={{ base: "flex-start", sm: "flex-end" }}
      justify="space-between"
      gap="3"
      mb="4"
    >
      <Box>
        <Heading as="h2" size="md">
          {title}
        </Heading>
        {description && (
          <Text mt="1" fontSize="sm" color="fg.muted">
            {description}
          </Text>
        )}
      </Box>
      {actions}
    </Flex>
  );
}

type Crumb = {
  label: string;
  to?: "/" | "/allocations" | "/professors" | "/courses" | "/departments";
};

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
};

export function PageHeader({
  title,
  description,
  icon,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <Stack spacing="4" mb="8">
      {breadcrumbs && (
        <Breadcrumb
          fontSize="sm"
          color="fg.muted"
          separator={<Icon as={ChevronRight} boxSize="3.5" mt="1" />}
        >
          {breadcrumbs.map((crumb) => (
            <BreadcrumbItem key={crumb.label} isCurrentPage={!crumb.to}>
              {crumb.to ? (
                <RouterLink to={crumb.to} _hover={{ color: "fg.accent" }}>
                  {crumb.label}
                </RouterLink>
              ) : (
                <Text
                  as="span"
                  aria-current="page"
                  color="fg.default"
                  noOfLines={1}
                >
                  {crumb.label}
                </Text>
              )}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      )}

      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        gap="4"
      >
        <HStack spacing="4" align="center" minW="0">
          {icon && (
            <Flex
              boxSize="12"
              flexShrink={0}
              align="center"
              justify="center"
              rounded="xl"
              bg="bg.accent"
              color="fg.accent"
            >
              <Icon as={icon} boxSize="6" />
            </Flex>
          )}

          <Box minW="0">
            <Heading as="h1" size="lg">
              {title}
            </Heading>
            {description && (
              <Text color="fg.muted" mt="1">
                {description}
              </Text>
            )}
          </Box>
        </HStack>

        {actions && (
          <HStack spacing="3" flexWrap="wrap" flexShrink={0}>
            {actions}
          </HStack>
        )}
      </Flex>
    </Stack>
  );
}
