import fs from "node:fs/promises"
import path from "node:path"

type Tab = "estados" | "municipios" | "poblados" | "zonas"
export type GeographyRow = { id: number; name: string; parent?: string; postal?: number; active: boolean }

const filePath = path.join(process.cwd(), "data", "geografia.json")
const seed: Record<Tab, GeographyRow[]> = {
  estados: ["Aguascalientes", "Baja California", "Campeche", "Chiapas", "Ciudad de México", "Jalisco"].map((name, i) => ({ id: i + 1, name, active: i !== 3 })),
  municipios: ["Aguascalientes", "Mexicali", "Campeche", "Tuxtla Gutiérrez", "Guadalajara"].map((name, i) => ({ id: i + 101, name, parent: ["Aguascalientes", "Baja California", "Campeche", "Chiapas", "Jalisco"][i], active: i !== 3 })),
  poblados: ["Centro", "San Marcos", "El Refugio", "La Paz"].map((name, i) => ({ id: i + 201, name, parent: "Aguascalientes / Aguascalientes", active: i !== 3 })),
  zonas: ["Zona Centro", "Zona Norte", "Zona Industrial", "Zona Histórica"].map((name, i) => ({ id: i + 301, name, parent: "Centro / Aguascalientes", postal: [20000, 20010, 21390, 24000][i], active: i !== 3 })),
}

async function read() {
  try { return JSON.parse(await fs.readFile(filePath, "utf8")) as Record<Tab, GeographyRow[]> }
  catch { await fs.mkdir(path.dirname(filePath), { recursive: true }); await fs.writeFile(filePath, JSON.stringify(seed, null, 2)); return structuredClone(seed) }
}
async function write(data: Record<Tab, GeographyRow[]>) { await fs.writeFile(filePath, JSON.stringify(data, null, 2)); return data }
export const getAll = read
export async function create(tab: Tab, input: Omit<GeographyRow, "id">) { const data = await read(); const row = { ...input, id: Date.now() }; data[tab].push(row); await write(data); return row }
export async function update(tab: Tab, id: number, patch: Partial<GeographyRow>) { const data = await read(); const row = data[tab].find((item) => item.id === id); if (!row) throw new Error("Registro no encontrado"); Object.assign(row, patch); await write(data); return row }
