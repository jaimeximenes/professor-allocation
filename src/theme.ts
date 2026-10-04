import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: false,
};

const fontStack = `"Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

export const theme = extendTheme({
  config,
  fonts: {
    heading: fontStack,
    body: fontStack,
  },
  colors: {
    brand: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
    },
  },
  // Tokens semânticos: um único nome com valores para o tema claro e o escuro.
  semanticTokens: {
    colors: {
      "bg.canvas": { default: "gray.50", _dark: "gray.900" },
      "bg.surface": { default: "white", _dark: "gray.800" },
      "bg.subtle": { default: "gray.50", _dark: "whiteAlpha.50" },
      "bg.muted": { default: "gray.100", _dark: "whiteAlpha.100" },
      "bg.accent": { default: "brand.50", _dark: "whiteAlpha.100" },
      "border.subtle": { default: "gray.200", _dark: "whiteAlpha.200" },
      "fg.default": { default: "gray.800", _dark: "gray.100" },
      "fg.muted": { default: "gray.600", _dark: "gray.400" },
      "fg.accent": { default: "brand.600", _dark: "brand.300" },
    },
  },
  styles: {
    global: {
      body: {
        bg: "bg.canvas",
        color: "fg.default",
      },
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: "brand" },
    },
    Heading: {
      baseStyle: { letterSpacing: "-0.02em" },
    },
    // O padrão do Chakra é caixa alta; "2h" e nomes próprios ficam melhores assim.
    Badge: {
      baseStyle: { textTransform: "none", fontWeight: "semibold" },
    },
  },
});
