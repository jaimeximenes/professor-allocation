import type { ID } from "@/types/entities";
import { ApiError } from "./errors";
import type { Collection, DataDriver } from "./types";

/** Formato de erro do backend (ErrorResponse do GlobalExceptionHandler). */
type ErrorBody = {
  message?: string;
  errors?: Array<{ field: string; message: string }>;
};

/**
 * O backend usa ids Long (números no JSON) e o json-server usa texto.
 * Normalizamos para texto para que comparações e rotas funcionem igual nos dois.
 */
function normalizeIds<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map(normalizeIds) as T;
  }

  if (data && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        (key === "id" || key.endsWith("Id")) && typeof value === "number"
          ? String(value)
          : value,
      ]),
    ) as T;
  }

  return data;
}

async function readErrorMessage(response: Response): Promise<string> {
  if (response.status >= 500) {
    return `O servidor encontrou um erro ao processar a requisição (status ${response.status}).`;
  }

  try {
    const body = (await response.json()) as ErrorBody;

    // Erros de validação (400) trazem a mensagem de cada campo inválido.
    if (body.errors?.length) {
      return body.errors
        .map((error) => error.message.replace(/\.?$/, "."))
        .join(" ");
    }

    if (body.message) {
      return body.message;
    }
  } catch {
    // Corpo vazio ou que não é JSON: usa a mensagem padrão abaixo.
  }

  return response.status === 404
    ? "Registro não encontrado."
    : `A API respondeu com o status ${response.status}.`;
}

/**
 * Fonte de dados que conversa com uma API REST: o backend Spring Boot
 * (porta 8080) ou o json-server (porta 3333), que imita as mesmas rotas.
 */
export function createHttpDriver(baseUrl: string): DataDriver {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: init.body
          ? { "Content-Type": "application/json", ...init.headers }
          : init.headers,
      });
    } catch {
      throw new ApiError(`Não foi possível conectar à API em ${baseUrl}.`, 0);
    }

    if (!response.ok) {
      throw new ApiError(await readErrorMessage(response), response.status);
    }

    // DELETE no backend responde 204 (sem corpo).
    if (response.status === 204) {
      return undefined as T;
    }

    return normalizeIds((await response.json()) as T);
  }

  const itemPath = (collection: Collection, id: ID) =>
    `/${collection}/${encodeURIComponent(id)}`;

  return {
    list: <T>(collection: Collection) => request<T[]>(`/${collection}`),

    get: <T>(collection: Collection, id: ID) =>
      request<T>(itemPath(collection, id)),

    create: <T>(collection: Collection, data: object) =>
      request<T>(`/${collection}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: <T>(collection: Collection, id: ID, data: object) =>
      request<T>(itemPath(collection, id), {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    remove: async (collection: Collection, id: ID) => {
      await request<unknown>(itemPath(collection, id), { method: "DELETE" });
    },
  };
}
