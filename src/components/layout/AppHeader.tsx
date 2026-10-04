import {
  Box,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Stack,
  Tooltip,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { Menu, Moon, Sun } from "lucide-react";
import { RouterLink } from "../links";
import { Logo } from "./Logo";
import { NAV_ITEMS } from "./navigation";

export function AppHeader() {
  const mobileMenu = useDisclosure();

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="bg.surface"
      borderBottomWidth="1px"
      borderColor="border.subtle"
    >
      <Container maxW="7xl">
        <Flex h="16" align="center" justify="space-between" gap="4">
          <HStack spacing="2">
            <IconButton
              display={{ base: "inline-flex", lg: "none" }}
              aria-label="Abrir menu de navegação"
              icon={<Icon as={Menu} boxSize="5" />}
              variant="ghost"
              colorScheme="gray"
              onClick={mobileMenu.onOpen}
            />
            <Logo />
          </HStack>

          <HStack
            as="nav"
            aria-label="Navegação principal"
            spacing="1"
            display={{ base: "none", lg: "flex" }}
          >
            {NAV_ITEMS.map((item) => (
              <RouterLink
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                display="flex"
                alignItems="center"
                gap="2"
                px="3"
                py="2"
                rounded="md"
                fontSize="sm"
                fontWeight="medium"
                color="fg.muted"
                _hover={{
                  textDecoration: "none",
                  bg: "bg.muted",
                  color: "fg.default",
                }}
                _activeLink={{ color: "fg.accent", bg: "bg.accent" }}
              >
                <Icon as={item.icon} boxSize="4" />
                {item.label}
              </RouterLink>
            ))}
          </HStack>

          <ColorModeToggle />
        </Flex>
      </Container>

      <Drawer
        isOpen={mobileMenu.isOpen}
        onClose={mobileMenu.onClose}
        placement="left"
      >
        <DrawerOverlay />
        <DrawerContent bg="bg.surface">
          <DrawerCloseButton top="4" />
          <DrawerHeader
            borderBottomWidth="1px"
            borderColor="border.subtle"
            pr="14"
          >
            <Logo />
          </DrawerHeader>
          <DrawerBody py="4">
            <Stack as="nav" aria-label="Navegação principal" spacing="1">
              {NAV_ITEMS.map((item) => (
                <RouterLink
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  onClick={mobileMenu.onClose}
                  display="flex"
                  alignItems="center"
                  gap="3"
                  px="3"
                  py="3"
                  rounded="md"
                  fontWeight="medium"
                  color="fg.muted"
                  _hover={{
                    textDecoration: "none",
                    bg: "bg.muted",
                    color: "fg.default",
                  }}
                  _activeLink={{ color: "fg.accent", bg: "bg.accent" }}
                >
                  <Icon as={item.icon} boxSize="5" />
                  {item.label}
                </RouterLink>
              ))}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const label =
    colorMode === "light" ? "Ativar tema escuro" : "Ativar tema claro";

  return (
    <Tooltip label={label} hasArrow openDelay={300}>
      <IconButton
        aria-label={label}
        icon={<Icon as={colorMode === "light" ? Moon : Sun} boxSize="5" />}
        variant="ghost"
        colorScheme="gray"
        onClick={toggleColorMode}
      />
    </Tooltip>
  );
}
