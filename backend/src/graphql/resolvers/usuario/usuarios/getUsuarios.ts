import {
    successResponse,
    errorResponse,
    prisma,
    verificarToken,
    crearBitacora,
    log
} from "@fn";

import { Prisma, Rol, AccionesBitacora } from "@prisma/client";

interface GetUsuariosArgs {
    token: string;
    filtro?: string;
}

const getUsuarios = async (_: unknown, args: GetUsuariosArgs) => {
    log.dev("getUsuarios called with args:", args);
    
    const { token, filtro } = args;

    if (!token) {
        return errorResponse({ message: "Token requerido" });
    }

    try {
        const usuario = await verificarToken(token);

        if (!usuario) {
            return errorResponse({ message: "Token inválido o expirado" });
        }

        const whereClause: Prisma.UsuarioWhereInput = {};

        if (filtro) {
            const filtroCleaned = filtro.trim();
            whereClause.OR = [
                { email: { contains: filtroCleaned } },
                { cedula: { contains: filtroCleaned } },
            ];
        }

        switch (usuario.rol) {
            case Rol.ADMIN:
                whereClause.rol = { in: [Rol.ADMIN, Rol.ASISTENTE] };
                break;
            case Rol.ASISTENTE:
                whereClause.rol = Rol.ASISTENTE;
                break;
            default:
                return errorResponse({ message: "Rol no válido" });
        }

        const usuarios = await prisma.usuario.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            omit: { password: true }
        });

        const total = await prisma.usuario.count({ where: whereClause });

        await crearBitacora({
            type: AccionesBitacora.GET_USUARIOS,
            usuarioId: usuario.id,
        });

        return successResponse({
            message: "Usuarios obtenidos correctamente",
            data: usuarios,
            meta: { total },
        });

    } catch (error) {
        console.error(error);
        return errorResponse({ message: "Error al obtener usuarios" });
    }
};

export default getUsuarios;