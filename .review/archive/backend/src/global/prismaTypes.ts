import { AccionesBitacora, Rol } from "./enums"

export interface Usuario {
  id: number
  primerNombre: string
  primerApellido: string
  avatar?: string
  telefono: string
  cedula: string
  email: string
  password: string
  Bitacora?: Bitacora[]
  rol: Rol
  createdAt: Date
  updatedAt: Date
}

export interface Bitacora {
  id: number
  usuarioId: number
  usuario?: Usuario
  type: AccionesBitacora
  fecha: Date
  mensaje?: string
}