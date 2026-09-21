import { errorResponse, prisma, successResponse, verificarToken } from "@fn";

interface GetGeografiaArgs {
    token: string;
    filtro?: string;
    soloActivos?: boolean;
}

const getGeografia = async (_: unknown, { token, filtro, soloActivos = false }: GetGeografiaArgs) => {
    try {
        const usuario = await verificarToken(token);
        if (!usuario) return errorResponse({ message: "Token inválido o expirado" });

        const estados = await prisma.estado.findMany({
            where: {
                ...(soloActivos ? { activo: true } : {}),
                ...(filtro?.trim() ? { nombre: { contains: filtro.trim(), mode: "insensitive" } } : {})
            },
            orderBy: { nombre: "asc" }
        });

        return successResponse({
            message: "Geografía obtenida correctamente",
            data: { estados },
            meta: { totalEstados: estados.length, totalMunicipios: 0, totalPoblados: 0, totalZonas: 0 }
        });
    } catch (error: any) {
        return errorResponse({ message: error.message || "Error al obtener la geografía" });
    }
};

export default getGeografia;
