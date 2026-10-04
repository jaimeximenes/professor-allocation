import { describe, expect, it } from "vitest";
import seed from "../../db/seed.json";
import { formatCpf, isCpfFormatValid, onlyDigits } from "./cpf";

describe("formatCpf", () => {
  it("aplica a máscara completa", () => {
    expect(formatCpf("12345678909")).toBe("123.456.789-09");
  });

  it("aplica a máscara parcial enquanto o usuário digita", () => {
    expect(formatCpf("1")).toBe("1");
    expect(formatCpf("1234")).toBe("123.4");
    expect(formatCpf("1234567")).toBe("123.456.7");
    expect(formatCpf("1234567890")).toBe("123.456.789-0");
  });

  it("ignora caracteres que não são dígitos e o excesso", () => {
    expect(formatCpf("123.456.789-09999")).toBe("123.456.789-09");
    expect(formatCpf("abc")).toBe("");
  });
});

describe("isCpfFormatValid (mesma regra do @Pattern do backend)", () => {
  it("aceita exatamente 11 dígitos", () => {
    expect(isCpfFormatValid("11111111111")).toBe(true);
    expect(isCpfFormatValid(onlyDigits("123.456.789-09"))).toBe(true);
  });

  it("recusa tamanho diferente ou caracteres não numéricos", () => {
    expect(isCpfFormatValid("1234567890")).toBe(false);
    expect(isCpfFormatValid("123456789012")).toBe(false);
    expect(isCpfFormatValid("123.456.789-09")).toBe(false);
  });

  it("aceita todos os CPFs dos dados de exemplo, sem repetição", () => {
    const cpfs = seed.professors.map((professor) => professor.cpf);

    expect(cpfs.every(isCpfFormatValid)).toBe(true);
    expect(new Set(cpfs).size).toBe(cpfs.length);
  });
});
