const rawApiUrl = import.meta.env.VITE_API_URL?.trim() ?? "";

/** URL base da API REST, sem barra no final (ex.: http://localhost:3333). */
export const API_URL = rawApiUrl.replace(/\/+$/, "");

/**
 * Sem VITE_API_URL o app usa o modo demonstração: os dados ficam no
 * localStorage do navegador. É o que permite publicar o build em hospedagens
 * estáticas (Vercel, Netlify), onde o json-server não roda.
 */
export const isDemoMode = API_URL === "";
