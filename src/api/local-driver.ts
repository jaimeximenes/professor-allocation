import seed from "../../db/seed.json";
import type { ID } from "@/types/entities";
import { ApiError } from "./errors";
import type { Collection, DataDriver } from "./types";

type Row = { id: ID } & Record<string, unknown>;
type Database = Record<Collection, Row[]>;

const STORAGE_KEY = "professor-allocation:database:v1";

/** Chave estrangeira usada pelos outros recursos para apontar para cada coleção. */
const FOREIGN_KEYS: Record<Collection, string> = {
  departments: "departmentId",
  courses: "courseId",
  professors: "professorId",
  allocations: "allocationId",
};

let database: Database | null = null;

function cloneSeed(): Database {
  return structuredClone(seed) as Database;
}

function getDatabase(): Database {
  if (!database) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      database = stored ? (JSON.parse(stored) as Database) : cloneSeed();
    } catch {
      // localStorage indisponível ou corrompido: usa os dados de exemplo.
      database = cloneSeed();
    }
  }

  return database;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getDatabase()));
  } catch {
    // Sem localStorage (ex.: navegação privada) os dados ficam só em memória.
  }
}

function newId(): ID {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
}

function findRow(collection: Collection, id: ID): Row {
  const row = getDatabase()[collection].find((item) => item.id === id);

  if (!row) {
    throw new ApiError("Registro não encontrado.", 404);
  }

  return row;
}

/** Pequena espera para simular a rede e exibir os estados de carregamento. */
const networkDelay = () => new Promise((resolve) => setTimeout(resolve, 120));

/**
 * Modo demonstração: implementa a mesma interface da API REST usando o
 * localStorage, imitando o comportamento do json-server.
 */
export const localDriver: DataDriver = {
  async list<T>(collection: Collection) {
    await networkDelay();
    return structuredClone(getDatabase()[collection]) as T[];
  },

  async get<T>(collection: Collection, id: ID) {
    await networkDelay();
    return structuredClone(findRow(collection, id)) as T;
  },

  async create<T>(collection: Collection, data: object) {
    await networkDelay();
    const row: Row = { ...data, id: newId() };
    getDatabase()[collection].push(row);
    persist();
    return structuredClone(row) as T;
  },

  async update<T>(collection: Collection, id: ID, data: object) {
    await networkDelay();
    const rows = getDatabase()[collection];
    const index = rows.indexOf(findRow(collection, id));
    const row: Row = { ...data, id };
    rows.splice(index, 1, row);
    persist();
    return structuredClone(row) as T;
  },

  async remove(collection: Collection, id: ID) {
    await networkDelay();
    findRow(collection, id); // lança 404 se o registro não existir

    const db = getDatabase();
    const foreignKey = FOREIGN_KEYS[collection];

    db[collection] = db[collection].filter((row) => row.id !== id);

    // Assim como o json-server, anula as referências ao registro excluído.
    for (const rows of Object.values(db)) {
      for (const row of rows) {
        if (row[foreignKey] === id) {
          row[foreignKey] = null;
        }
      }
    }

    persist();
  },
};

/** Restaura os dados de exemplo (db/seed.json) no modo demonstração. */
export function resetLocalDatabase() {
  database = cloneSeed();
  persist();
}
