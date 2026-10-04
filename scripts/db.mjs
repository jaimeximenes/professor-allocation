// Prepara o banco do json-server (db/database.json) a partir dos dados de exemplo (db/seed.json).
//
//   node scripts/db.mjs ensure  -> cria o banco somente se ele ainda não existir
//   node scripts/db.mjs reset   -> sobrescreve o banco com os dados de exemplo
import { copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const seedFile = fileURLToPath(new URL("../db/seed.json", import.meta.url));
const databaseFile = fileURLToPath(
  new URL("../db/database.json", import.meta.url),
);

const command = process.argv[2] ?? "ensure";

if (command === "reset") {
  copyFileSync(seedFile, databaseFile);
  console.log("Banco restaurado a partir de db/seed.json.");
} else if (command === "ensure") {
  if (!existsSync(databaseFile)) {
    copyFileSync(seedFile, databaseFile);
    console.log("Banco criado a partir de db/seed.json.");
  }
} else {
  console.error(`Comando desconhecido: ${command}. Use "ensure" ou "reset".`);
  process.exit(1);
}
