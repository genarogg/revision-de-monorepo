import { AccionesBitacora, Rol } from "@prisma/client";
import { crearBitacora, errorResponse, prisma, successResponse, verificarToken } from "@fn";

interface UpdateEstadoArgs {
    token: string;
    id: number;
    nombre?: string;
    activo?: boolean;
}

const updateEstado = async (_: unknown, { token, id, nombre, activo }: UpdateEstadoArgs) => {
    try {
        const usuario = await verificarToken(token);
        if (!usuario) return errorResponse({ message: "Token inválido o expirado" });
        if (usuario.rol !== Rol.ADMIN && usuario.rol !== Rol.EDITOR) {
            return errorResponse({ message: "Usuario no autorizado" });
        }

        const data = {
            ...(nombre !== undefined ? { nombre: nombre.trim() } : {}),
            ...(activo !== undefined ? { activo } : {})
        };
        if (data.nombre !== undefined && !data.nombre) {
            return errorResponse({ message: "El nombre del estado es requerido" });
        }

        const estado = await prisma.estado.update({ where: { id }, data });
        await crearBitacora({
            usuarioId: usuario.id,
            type: AccionesBitacora.VIEW,
            mensaje: `Se actualizó el estado ${estado.nombre}`
        });

        return successResponse({ message: "Estado actualizado correctamente", data: estado });
    } catch (error: any) {
        return errorResponse({ message: error.code === "P2025" ? "Estado no encontrado" : error.message });
    }
};

export default updateEstado;
