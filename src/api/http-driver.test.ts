import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./errors";
import { createHttpDriver } from "./http-driver";

const api = createHttpDriver("http://localhost:8080");

function mockFetch(status: number, body?: unknown) {
  const fetchMock = vi.fn(async () =>
    body === undefined
      ? new Response(null, { status })
      : Response.json(body, { status }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// Respostas reais do backend Spring Boot (GlobalExceptionHandler).
describe("createHttpDriver", () => {
  it("converte ids numéricos (Long) em texto", async () => {
    mockFetch(200, [
      {
        id: 1,
        dayOfWeek: "MONDAY",
        startHour: "08:00:00",
        endHour: "10:00:00",
        professorId: 1,
        courseId: 3,
      },
    ]);

    await expect(api.list("allocations")).resolves.toEqual([
      {
        id: "1",
        dayOfWeek: "MONDAY",
        startHour: "08:00:00",
        endHour: "10:00:00",
        professorId: "1",
        courseId: "3",
      },
    ]);
  });

  it("envia JSON no POST e no PUT", async () => {
    const fetchMock = mockFetch(201, { id: 9, name: "Educação" });

    await api.create("departments", { name: "Educação" });
    await api.update("departments", "9", { name: "Educação" });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8080/departments",
      expect.objectContaining({ method: "POST", body: '{"name":"Educação"}' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8080/departments/9",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("aceita DELETE com 204 (sem corpo)", async () => {
    mockFetch(204);

    await expect(api.remove("courses", "1")).resolves.toBeUndefined();
  });

  it("usa a mensagem de regra de negócio do backend (400)", async () => {
    mockFetch(400, {
      status: 400,
      error: "Bad Request",
      message: "O professor já possui uma alocação nesse horário.",
      errors: null,
    });

    await expect(api.create("allocations", {})).rejects.toThrow(
      "O professor já possui uma alocação nesse horário.",
    );
  });

  it("junta as mensagens de validação dos campos (400)", async () => {
    mockFetch(400, {
      status: 400,
      error: "Validation Failed",
      message: "One or more validation constraints failed",
      errors: [
        {
          field: "cpf",
          message: "O CPF deve conter exatamente 11 dígitos numéricos",
        },
        { field: "name", message: "O nome do professor é obrigatório" },
      ],
    });

    await expect(api.create("professors", {})).rejects.toThrow(
      "O CPF deve conter exatamente 11 dígitos numéricos. O nome do professor é obrigatório.",
    );
  });

  it("marca 404 com o status para a tela de não encontrado", async () => {
    mockFetch(404, { message: "Curso não encontrado com o ID: 999" });

    const error = await api.get("courses", "999").catch((reason) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      message: "Curso não encontrado com o ID: 999",
    });
  });

  it("não expõe detalhes técnicos de erros 500", async () => {
    mockFetch(500, {
      message: "An unexpected error occurred: could not execute statement",
    });

    await expect(api.remove("departments", "1")).rejects.toThrow(
      "O servidor encontrou um erro ao processar a requisição (status 500).",
    );
  });

  it("explica quando a API está fora do ar", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    const error = await api.list("courses").catch((reason) => reason);

    expect(error).toMatchObject({
      status: 0,
      message: "Não foi possível conectar à API em http://localhost:8080.",
    });
  });
});
