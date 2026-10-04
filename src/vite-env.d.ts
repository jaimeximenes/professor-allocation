/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base da API REST. Quando vazia, o app usa o modo demonstração (localStorage). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
