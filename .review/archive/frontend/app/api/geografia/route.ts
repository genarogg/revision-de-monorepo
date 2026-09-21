import { NextRequest, NextResponse } from "next/server"
import { canWrite, getUserFromToken } from "@/lib/geografia-auth"
import { create, getAll, update } from "@/lib/geografia-store"

export const runtime = "nodejs"
const tabs = ["estados", "municipios", "poblados", "zonas"] as const
function auth(request: NextRequest) { return getUserFromToken(request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")) }
function bad(message: string, status = 400) { return NextResponse.json({ error: message }, { status }) }

export async function GET(request: NextRequest) {
  const user = auth(request); if (!user) return bad("Token inválido", 401)
  return NextResponse.json({ data: await getAll(), user: { id: user.id, name: user.name, role: user.role } })
}
export async function POST(request: NextRequest) {
  const user = auth(request); if (!user) return bad("Token inválido", 401); if (!canWrite(user.role)) return bad("El rol no puede modificar catálogos", 403)
  const body = await request.json(); if (!tabs.includes(body.tab)) return bad("Catálogo inválido"); if (!String(body.name ?? "").trim()) return bad("El nombre es obligatorio")
  return NextResponse.json({ data: await create(body.tab, { name: String(body.name).trim(), parent: body.parent, postal: body.postal, active: body.active ?? true }) }, { status: 201 })
}
export async function PATCH(request: NextRequest) {
  const user = auth(request); if (!user) return bad("Token inválido", 401); if (!canWrite(user.role)) return bad("El rol no puede modificar catálogos", 403)
  const body = await request.json(); if (!tabs.includes(body.tab) || !Number.isInteger(body.id)) return bad("Solicitud inválida")
  return NextResponse.json({ data: await update(body.tab, body.id, body.patch ?? {}) })
}
