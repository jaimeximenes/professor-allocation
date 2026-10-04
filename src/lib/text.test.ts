import { describe, expect, it } from "vitest";
import { isNameTaken, matchesSearch, pluralize } from "./text";

describe("isNameTaken (coluna unique do backend)", () => {
  const departments = [
    { id: "1", name: "Computação e Tecnologia" },
    { id: "2", name: "Ciências Exatas" },
  ];

  it("compara sem diferenciar maiúsculas, acentos e espaços extras", () => {
    expect(isNameTaken(departments, "  computacao   e tecnologia ")).toBe(true);
    expect(isNameTaken(departments, "CIÊNCIAS EXATAS")).toBe(true);
    expect(isNameTaken(departments, "Educação")).toBe(false);
  });

  it("ignora o próprio registro ao editar", () => {
    expect(isNameTaken(departments, "Ciências Exatas", "2")).toBe(false);
  });
});

describe("matchesSearch e pluralize", () => {
  it("busca por trecho do nome sem diferenciar acentos", () => {
    expect(matchesSearch("Cálculo I", "calc")).toBe(true);
    expect(matchesSearch("Cálculo I", "física")).toBe(false);
  });

  it("escolhe singular ou plural", () => {
    expect(pluralize(1, "aula", "aulas")).toBe("1 aula");
    expect(pluralize(3, "aula", "aulas")).toBe("3 aulas");
    expect(pluralize(0, "aula", "aulas")).toBe("0 aulas");
  });
});
