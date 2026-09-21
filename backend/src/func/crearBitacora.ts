import { prisma } from "@fn";
import { AccionesBitacora } from "@prisma/client";

interface CrearBitacoraArgs {
  usuarioId: number;
  mensaje?: string;
  type: AccionesBitacora;
}

const crearBitacora = async ({
  usuarioId,
  mensaje = "N/A",
  type,

}: CrearBitacoraArgs) => {
  try {

    const bitacora = await prisma.bitacora.create({
      data: {
        usuarioId,
        type,
        mensaje,
      },
    });

    return bitacora;
  } catch (error) {
    console.error("Error al crear la bitácora:", error);
    throw new Error("No se pudo crear la bitácora");
  }
};

export default crearBitacora;