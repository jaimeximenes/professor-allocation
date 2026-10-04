/** Normaliza textos para comparação: sem acentos, sem espaços extras e minúsculo. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function matchesSearch(value: string, search: string): boolean {
  return normalizeText(value).includes(normalizeText(search));
}

/**
 * Os nomes de departamento e curso são `unique` no banco do backend (MySQL
 * compara sem diferenciar maiúsculas e acentos), então validamos o mesmo aqui.
 */
export function isNameTaken(
  items: Array<{ id: string; name: string }>,
  name: string,
  currentId?: string,
): boolean {
  const normalizedName = normalizeText(name);

  return items.some(
    (item) =>
      item.id !== currentId && normalizeText(item.name) === normalizedName,
  );
}

export function byName<T extends { name: string }>(
  first: T,
  second: T,
): number {
  return first.name.localeCompare(second.name, "pt-BR");
}

/** pluralize(1, "professor", "professores") -> "1 professor" */
export function pluralize(
  count: number,
  singular: string,
  plural: string,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
