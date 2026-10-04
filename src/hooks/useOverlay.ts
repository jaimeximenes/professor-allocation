import { useCallback, useState } from "react";

type OverlayState<T> = {
  isOpen: boolean;
  data: T | null;
  /** Muda a cada abertura; usado como `key` para recriar o formulário limpo. */
  key: number;
};

/**
 * Controla drawers e diálogos que recebem um registro (ex.: editar/excluir).
 * O registro continua disponível depois de fechar, para que o conteúdo não
 * suma durante a animação de saída.
 */
export function useOverlay<T>() {
  const [state, setState] = useState<OverlayState<T>>({
    isOpen: false,
    data: null,
    key: 0,
  });

  const open = useCallback((data: T | null = null) => {
    setState((previous) => ({ isOpen: true, data, key: previous.key + 1 }));
  }, []);

  const close = useCallback(() => {
    setState((previous) => ({ ...previous, isOpen: false }));
  }, []);

  return { ...state, open, close };
}
