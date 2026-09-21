import { AccionesBitacora, Rol } from "@prisma/client";
import { crearBitacora, errorResponse, prisma, successResponse, verificarToken } from "@fn";

async function authorize(token: string) {
  const usuario = await verificarToken(token);
  if (!usuario) throw new Error("Token inválido o expirado");
  if (usuario.rol !== Rol.ADMIN && usuario.rol !== Rol.EDITOR) throw new Error("Usuario no autorizado");
  return usuario;
}

export const createMunicipio = async (_: unknown, { token, estadoId, nombre, vigencia = true }: any) => {
  try { const usuario = await authorize(token); const municipio = await prisma.municipio.create({ data: { estadoId, nombre: nombre.trim(), vigencia } }); await crearBitacora({ usuarioId: usuario.id, type: AccionesBitacora.VIEW, mensaje: `Se creó el municipio ${municipio.nombre}` }); return successResponse({ message: "Municipio creado correctamente", data: municipio }); } catch (error: any) { return errorResponse({ message: error.message || "Error al crear el municipio" }); }
};

export const updateMunicipio = async (_: unknown, { token, id, estadoId, nombre, vigencia }: any) => {
  try { const usuario = await authorize(token); const municipio = await prisma.municipio.update({ where: { id }, data: { ...(estadoId !== undefined ? { estadoId } : {}), ...(nombre !== undefined ? { nombre: nombre.trim() } : {}), ...(vigencia !== undefined ? { vigencia } : {}) } }); await crearBitacora({ usuarioId: usuario.id, type: AccionesBitacora.VIEW, mensaje: `Se actualizó el municipio ${municipio.nombre}` }); return successResponse({ message: "Municipio actualizado correctamente", data: municipio }); } catch (error: any) { return errorResponse({ message: error.code === "P2025" ? "Municipio no encontrado" : error.message }); }
};

export const createPoblado = async (_: unknown, { token, municipioId, nombre, vigencia = true }: any) => {
  try { const usuario = await authorize(token); const poblado = await prisma.poblado.create({ data: { municipioId, nombre: nombre.trim(), vigencia } }); await crearBitacora({ usuarioId: usuario.id, type: AccionesBitacora.VIEW, mensaje: `Se creó el poblado ${poblado.nombre}` }); return successResponse({ message: "Poblado creado correctamente", data: poblado }); } catch (error: any) { return errorResponse({ message: error.message || "Error al crear el poblado" }); }
};

export const updatePoblado = async (_: unknown, { token, id, municipioId, nombre, vigencia }: any) => {
  try { const usuario = await authorize(token); const poblado = await prisma.poblado.update({ where: { id }, data: { ...(municipioId !== undefined ? { municipioId } : {}), ...(nombre !== undefined ? { nombre: nombre.trim() } : {}), ...(vigencia !== undefined ? { vigencia } : {}) } }); await crearBitacora({ usuarioId: usuario.id, type: AccionesBitacora.VIEW, mensaje: `Se actualizó el poblado ${poblado.nombre}` }); return successResponse({ message: "Poblado actualizado correctamente", data: poblado }); } catch (error: any) { return errorResponse({ message: error.code === "P2025" ? "Poblado no encontrado" : error.message }); }
};

export const createZona = async (_: unknown, { token, pobladoId, codigoPostal, zona, vigencia = true }: any) => {
  try { const usuario = await authorize(token); const registro = await prisma.zonaUrbanizacion.create({ data: { pobladoId, codigoPostal, zona: zona.trim(), vigencia } }); await crearBitacora({ usuarioId: usuario.id, type: AccionesBitacora.VIEW, mensaje: `Se creó la zona ${registro.zona}` }); return successResponse({ message: "Zona creada correctamente", data: registro }); } catch (error: any) { return errorResponse({ message: error.message || "Error al crear la zona" }); }
};

export const updateZona = async (_: unknown, { token, id, pobladoId, codigoPostal, zona, vigencia }: any) => {
  try { const usuario = await authorize(token); const registro = await prisma.zonaUrbanizacion.update({ where: { id }, data: { ...(pobladoId !== undefined ? { pobladoId } : {}), ...(codigoPostal !== undefined ? { codigoPostal } : {}), ...(zona !== undefined ? { zona: zona.trim() } : {}), ...(vigencia !== undefined ? { vigencia } : {}) } }); await crearBitacora({ usuarioId: usuario.id, type: AccionesBitacora.VIEW, mensaje: `Se actualizó la zona ${registro.zona}` }); return successResponse({ message: "Zona actualizada correctamente", data: registro }); } catch (error: any) { return errorResponse({ message: error.code === "P2025" ? "Zona no encontrada" : error.message }); }
};
