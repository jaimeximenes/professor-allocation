import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { CalendarClock } from "lucide-react";
import { RouterLink } from "../links";

export function Logo() {
  return (
    <RouterLink
      to="/"
      display="flex"
      alignItems="center"
      gap="2.5"
      _hover={{ textDecoration: "none" }}
      aria-label="Professor Allocation, página inicial"
    >
      <Flex
        boxSize="9"
        align="center"
        justify="center"
        rounded="lg"
        bg="brand.600"
        color="white"
        shadow="sm"
      >
        <Icon as={CalendarClock} boxSize="5" />
      </Flex>
      <Box lineHeight="1.15">
        <Text fontWeight="bold" letterSpacing="-0.01em">
          Professor Allocation
        </Text>
        <Text fontSize="xs" color="fg.muted">
          Fafire · Frontend 2026
        </Text>
      </Box>
    </RouterLink>
  );
}
