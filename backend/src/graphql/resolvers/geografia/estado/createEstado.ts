import { AccionesBitacora, Rol } from "@prisma/client";
import { crearBitacora, errorResponse, prisma, successResponse, verificarToken } from "@fn";

interface CreateEstadoArgs {
    token: string;
    nombre: string;
    activo?: boolean;
}

const createEstado = async (_: unknown, { token, nombre, activo = true }: CreateEstadoArgs) => {
    try {
        const usuario = await verificarToken(token);
        if (!usuario) return errorResponse({ message: "Token inválido o expirado" });
        if (usuario.rol !== Rol.ADMIN && usuario.rol !== Rol.EDITOR) {
            return errorResponse({ message: "Usuario no autorizado" });
        }

        const nombreLimpio = nombre.trim();
        if (!nombreLimpio) return errorResponse({ message: "El nombre del estado es requerido" });

        const existente = await prisma.estado.findUnique({ where: { nombre: nombreLimpio } });
        if (existente) return errorResponse({ message: "El estado ya existe" });

        const estado = await prisma.estado.create({
            data: { nombre: nombreLimpio, activo }
        });

        await crearBitacora({
            usuarioId: usuario.id,
            type: AccionesBitacora.VIEW,
            mensaje: `Se creó el estado ${estado.nombre}`
        });

        return successResponse({ message: "Estado creado correctamente", data: estado });
    } catch (error: any) {
        return errorResponse({ message: error.message || "Error al crear el estado" });
    }
};

export default createEstado;
