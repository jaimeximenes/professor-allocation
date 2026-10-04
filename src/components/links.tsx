import {
  Button,
  IconButton,
  Link,
  type ButtonProps,
  type IconButtonProps,
  type LinkProps,
} from "@chakra-ui/react";
import { createLink } from "@tanstack/react-router";
import { forwardRef } from "react";

/*
 * Componentes do Chakra integrados ao TanStack Router com `createLink`:
 * mantêm o visual do Chakra e ganham rotas tipadas, preload e estado ativo
 * (aria-current="page", estilizável com `_activeLink`).
 */

const ChakraLink = forwardRef<HTMLAnchorElement, LinkProps>(
  function ChakraLink(props, ref) {
    return <Link ref={ref} {...props} />;
  },
);

const ChakraButtonLink = forwardRef<HTMLAnchorElement, ButtonProps>(
  function ChakraButtonLink(props, ref) {
    return <Button as="a" ref={ref} {...props} />;
  },
);

const ChakraIconButtonLink = forwardRef<HTMLAnchorElement, IconButtonProps>(
  function ChakraIconButtonLink(props, ref) {
    return <IconButton as="a" ref={ref} {...props} />;
  },
);

export const RouterLink = createLink(ChakraLink);
export const ButtonLink = createLink(ChakraButtonLink);
export const IconButtonLink = createLink(ChakraIconButtonLink);
