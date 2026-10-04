import type { ID } from "@/types/entities";

/** Recursos REST da API (mesmas rotas dos controllers do backend e do json-server). */
export type Collection =
  "departments" | "courses" | "professors" | "allocations";

/**
 * Contrato comum às duas fontes de dados do app: a API REST (json-server) e
 * o modo demonstração (localStorage). As telas não sabem qual está em uso.
 */
export interface DataDriver {
  list<T>(collection: Collection): Promise<T[]>;
  get<T>(collection: Collection, id: ID): Promise<T>;
  create<T>(collection: Collection, data: object): Promise<T>;
  update<T>(collection: Collection, id: ID, data: object): Promise<T>;
  remove(collection: Collection, id: ID): Promise<void>;
}
