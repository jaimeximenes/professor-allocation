import { API_URL, isDemoMode } from "./config";
import { createHttpDriver } from "./http-driver";
import { localDriver } from "./local-driver";
import type { DataDriver } from "./types";

/** Fonte de dados usada por todo o app, escolhida a partir de VITE_API_URL. */
export const api: DataDriver = isDemoMode
  ? localDriver
  : createHttpDriver(API_URL);
