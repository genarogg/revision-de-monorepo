"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2, Home, Map, MapPinned, Moon, Pencil, Plus, Power, Search, Sun, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/context/auth/AuthContext"
import GET_GEOGRAFIA from "@/query/geografia/GET_GEOGRAFIA"
import { CREATE_ESTADO, UPDATE_ESTADO } from "@/query/geografia/ESTADOS"
import { CREATE_MUNICIPIO, UPDATE_MUNICIPIO } from "@/query/geografia/MUNICIPIOS"

type Tab = "estados" | "municipios" | "poblados" | "zonas"
type Row = { id: number; name: string; parent?: string; postal?: number; active: boolean }

const labels: Record<Tab, { singular: string; plural: string; description: string; icon: typeof MapPinned }> = {
  estados: { singular: "Estado", plural: "Estados del país", description: "Catálogo de estados y entidades federativas", icon: MapPinned },
  municipios: { singular: "Municipio", plural: "Municipios", description: "Municipios vinculados a cada estado", icon: Building2 },
  poblados: { singular: "Poblado", plural: "Poblados", description: "Localidades y poblados del municipio", icon: Home },
  zonas: { singular: "Zona / Urbanización", plural: "Zonas y urbanizaciones", description: "Zonas postales y urbanizaciones", icon: Map },
}

const initial: Record<Tab, Row[]> = {
  estados: ["Aguascalientes", "Baja California", "Campeche", "Chiapas", "Ciudad de México", "Jalisco"].map((name, i) => ({ id: i + 1, name, active: i !== 3 })),
  municipios: ["Aguascalientes", "Mexicali", "Campeche", "Tuxtla Gutiérrez", "Guadalajara"].map((name, i) => ({ id: i + 101, name, parent: ["Aguascalientes", "Baja California", "Campeche", "Chiapas", "Jalisco"][i], active: i !== 3 })),
  poblados: ["Centro", "San Marcos", "El Refugio", "La Paz"].map((name, i) => ({ id: i + 201, name, parent: "Aguascalientes / Aguascalientes", active: i !== 3 })),
  zonas: ["Zona Centro", "Zona Norte", "Zona Industrial", "Zona Histórica"].map((name, i) => ({ id: i + 301, name, parent: "Centro / Aguascalientes", postal: [20000, 20010, 21390, 24000][i], active: i !== 3 })),
}

export default function GeografiaView() {
  const [tab, setTab] = useState<Tab>("estados")
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(true)
  const token = useAuthStore((state) => state.token)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: GET_GEOGRAFIA.loc?.source.body, variables: { token } }),
    })
      .then((response) => response.json())
      .then((payload) => {
        const result = payload.data?.getGeografia?.data
        if (result) {
          setData({
            estados: (result.estados ?? []).map((estado: { id: number; nombre: string; activo: boolean }) => ({ id: estado.id, name: estado.nombre, active: estado.activo })),
            municipios: (result.municipios ?? []).map((item: { id: number; estadoId: number; nombre: string; vigencia: boolean }) => ({ id: item.id, name: item.nombre, parent: `Estado #${item.estadoId}`, active: item.vigencia })),
            poblados: (result.poblados ?? []).map((item: { id: number; municipioId: number; nombre: string; vigencia: boolean }) => ({ id: item.id, name: item.nombre, parent: `Municipio #${item.municipioId}`, active: item.vigencia })),
            zonas: (result.zonas ?? []).map((item: { id: number; pobladoId: number; codigoPostal: number; zona: string; vigencia: boolean }) => ({ id: item.id, name: item.zona, parent: `Poblado #${item.pobladoId}`, postal: item.codigoPostal, active: item.vigencia })),
          })
        }
      })
      .finally(() => setLoading(false))
  }, [token])
  const [filter, setFilter] = useState<"todos" | "vigentes" | "inactivos">("todos")
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    document.documentElement.classList.toggle("light", !dark)
  }, [dark])

  const [form, setForm] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [name, setName] = useState("")
  const [estadoId, setEstadoId] = useState("")
  const current = labels[tab]
  const Icon = current.icon
  const rows = useMemo(() => data[tab].filter((row) => row.name.toLowerCase().includes(search.toLowerCase()) && (filter === "todos" || (filter === "vigentes" ? row.active : !row.active))), [data, tab, search, filter])
  const activeCount = (key: Tab) => data[key].filter((row) => row.active).length
  const save = async () => {
    if (!name.trim() || !token) return
    if (tab === "municipios" && !estadoId) return
    if (tab !== "estados" && tab !== "municipios") return
    const isMunicipio = tab === "municipios"
    const mutation = isMunicipio ? (editing ? UPDATE_MUNICIPIO : CREATE_MUNICIPIO) : (editing ? UPDATE_ESTADO : CREATE_ESTADO)
    const variables = isMunicipio
      ? (editing ? { token, id: editing.id, estadoId: Number(estadoId), nombre: name.trim() } : { token, estadoId: Number(estadoId), nombre: name.trim(), vigencia: true })
      : (editing ? { token, id: editing.id, nombre: name.trim() } : { token, nombre: name.trim(), activo: true })
    const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: mutation.loc?.source.body, variables }),
    })
    const payload = await response.json()
    const record = payload.data?.[isMunicipio ? (editing ? "updateMunicipio" : "createMunicipio") : (editing ? "updateEstado" : "createEstado")]?.data
    if (!record) return
    const row = isMunicipio
      ? { id: record.id, name: record.nombre, parent: `Estado #${record.estadoId}`, active: record.vigencia }
      : { id: record.id, name: record.nombre, active: record.activo }
    setData((all) => ({ ...all, [tab]: editing ? all[tab].map((item) => item.id === row.id ? row : item) : [...all[tab], row] }))
    setForm(false)
    setEditing(null)
    setName("")
    setEstadoId("")
  }
  const open = (row?: Row) => {
    setEditing(row ?? null)
    setName(row?.name ?? "")
    setEstadoId(row?.parent?.match(/#(\d+)/)?.[1] ?? (tab === "municipios" ? String(data.estados.find((item) => item.active)?.id ?? "") : ""))
    setForm(true)
  }
  const close = () => { setForm(false); setEditing(null); setName(""); setEstadoId("") }

  return <div className={dark ? "dark min-h-screen bg-background" : "light min-h-screen bg-background"}>
    <Button variant="outline" size="icon" className="fixed bottom-5 right-5 z-40 rounded-full border-border bg-card/95 text-foreground shadow-lg backdrop-blur hover:bg-muted" onClick={() => setDark(!dark)} aria-label="Cambiar tema">{dark ? <Sun /> : <Moon />}</Button>
    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8"><div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-2 text-sm text-muted-foreground">Configuración / <span className="text-foreground">Geografía</span></p><h2 className="text-3xl font-semibold tracking-tight text-foreground">Geografía</h2><p className="mt-1 text-muted-foreground">Administra los catálogos territoriales del municipio.</p></div><div className="flex items-center gap-2"><span className="rounded-full border bg-card px-3 py-2 text-xs text-muted-foreground">Datos de ejemplo</span><Button onClick={() => open()}><Plus data-icon="inline-start" /> Nuevo {current.singular}</Button></div></div>
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:mb-7 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">{(Object.keys(labels) as Tab[]).map((key) => { const CardIcon = labels[key].icon; return <button key={key} onClick={() => { setTab(key); setSearch(""); setFilter("todos") }} className={`rounded-xl border bg-card p-3 text-left transition hover:shadow-md sm:p-4 ${tab === key ? "border-primary/50 ring-1 ring-primary/20" : ""}`}><div className="flex items-center justify-between"><span className={`flex size-8 items-center justify-center rounded-lg sm:size-9 ${tab === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}><CardIcon /></span><span className="text-xl font-semibold text-card-foreground sm:text-2xl">{activeCount(key)}</span></div><p className="mt-2.5 truncate text-xs font-medium text-card-foreground sm:mt-4 sm:text-sm">{labels[key].plural}</p><p className="truncate text-[11px] text-muted-foreground sm:text-xs">registros vigentes</p></button> })}</div>
      <section className="overflow-hidden rounded-xl border bg-card shadow-sm"><div className="flex flex-col justify-between gap-4 border-b p-5 lg:flex-row lg:items-center"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-secondary"><Icon /></span><div><h3 className="font-semibold text-card-foreground">{current.plural}</h3><p className="text-sm text-muted-foreground">{current.description}</p></div></div><div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-end"><div className="relative"><Search className="absolute left-3 top-2.5 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Buscar ${current.singular.toLowerCase()}...`} className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm sm:w-64" /></div><div className="flex rounded-lg border p-1">{(["todos", "vigentes", "inactivos"] as const).map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-md px-3 py-1.5 text-xs ${filter === value ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground"}`}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div></div></div>
        <div className="overflow-x-auto p-3 sm:p-0"><table className="geografia-table w-full font-nunito text-sm"><thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-3">ID</th><th className="px-5 py-3">{current.singular}</th>{tab !== "estados" && <th className="px-5 py-3">Registro superior</th>}{tab === "zonas" && <th className="px-5 py-3">Código postal</th>}<th className="px-5 py-3">Vigencia</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y [&>tr:nth-child(even)]:bg-muted/20">{rows.map((row) => <tr key={row.id} className="hover:bg-muted/30"><td data-label="ID" className="px-5 py-4 font-mono text-xs text-muted-foreground">#{row.id}</td><td data-label={current.singular} className="px-5 py-4 font-medium text-foreground">{row.name}</td>{tab !== "estados" && <td data-label="Registro superior" className="px-5 py-4 text-muted-foreground">{row.parent}</td>}{tab === "zonas" && <td data-label="Código postal" className="px-5 py-4 text-muted-foreground">{row.postal}</td>}<td data-label="Vigencia" className="px-5 py-4"><button type="button" role="switch" aria-checked={row.active} onClick={async () => { if (!token || tab !== "estados") return; const active = !row.active; const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "/graphql", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: UPDATE_ESTADO.loc?.source.body, variables: { token, id: row.id, activo: active } }) }); const payload = await response.json(); const estado = payload.data?.updateEstado?.data; if (estado) { const updated = { id: estado.id, name: estado.nombre, active: estado.activo }; setData((all) => ({ ...all, estados: all.estados.map((item) => item.id === row.id ? updated : item) })) } }} aria-label={`${row.active ? "Desactivar" : "Activar"} ${row.name}`} className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${row.active ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300" : "border-border bg-muted text-muted-foreground"}`}><span className={`flex size-5 items-center justify-center rounded-full ${row.active ? "bg-emerald-600 text-white" : "bg-muted-foreground/30 text-muted-foreground"}`}><Power /></span>{row.active ? "Vigente" : "Inactivo"}</button></td><td data-label="Acciones" className="px-5 py-4 text-right"><Button variant="ghost" size="icon" className="text-slate-700 hover:text-slate-950 dark:text-foreground dark:hover:text-foreground" onClick={() => open(row)} aria-label={`Editar ${row.name}`}><Pencil /></Button></td></tr>)}</tbody></table></div>
        {rows.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No hay registros que coincidan con la búsqueda.</p>}
      </section>
    </main>
    {form && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}><section role="dialog" aria-modal="true" aria-labelledby="geografia-modal-title" className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl bg-white p-6 text-slate-900 shadow-2xl dark:bg-card dark:text-foreground sm:rounded-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Catálogo geográfico</p><h2 id="geografia-modal-title" className="mt-1 text-xl font-semibold text-slate-900 dark:text-foreground">{editing ? `Editar ${current.singular}` : `Nuevo ${current.singular}`}</h2><p className="mt-1 text-sm text-slate-600 dark:text-muted-foreground">Completa la información del registro.</p></div><Button variant="ghost" size="icon" className="text-slate-700 hover:text-slate-950 dark:text-foreground dark:hover:text-foreground" onClick={close} aria-label="Cerrar"><X /></Button></div>{tab === "municipios" && <label className="mt-8 flex flex-col gap-2 text-sm font-medium text-slate-800 dark:text-foreground">Estado<select value={estadoId} onChange={(event) => setEstadoId(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:ring-2 focus:ring-ring dark:border-border dark:bg-background dark:text-foreground"><option value="">Selecciona un estado vigente</option>{data.estados.filter((estado) => estado.active).map((estado) => <option key={estado.id} value={estado.id}>{estado.name}</option>)}</select></label>}
      <label className={`${tab === "municipios" ? "mt-4" : "mt-8"} flex flex-col gap-2 text-sm font-medium text-slate-800 dark:text-foreground`}>Nombre<input autoFocus value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) save() }} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-offset-background placeholder:text-slate-400 focus:ring-2 focus:ring-ring dark:border-border dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground" placeholder={`Nombre del ${current.singular.toLowerCase()}`} /></label><div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="outline" className="border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-950 dark:border-border dark:text-foreground dark:hover:bg-muted" onClick={close}>Cancelar</Button><Button className="sm:min-w-32" disabled={!name.trim()} onClick={save}>{editing ? "Guardar cambios" : "Crear registro"}</Button></div></section></div>}
  </div>
}

