export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Mesma regra do backend (ProfessorDTO): @Pattern(regexp = "\\d{11}"),
 * ou seja, exatamente 11 dígitos numéricos, sem máscara.
 */
export function isCpfFormatValid(value: string): boolean {
  return /^\d{11}$/.test(value);
}

/** Aplica a máscara 000.000.000-00 enquanto o usuário digita. */
export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  const blocks = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)];
  const checkDigits = digits.slice(9, 11);

  return (
    blocks.filter(Boolean).join(".") + (checkDigits ? `-${checkDigits}` : "")
  );
}
