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

        const [estados, municipios, poblados, zonas] = await prisma.$transaction([
            prisma.estado.findMany({ where: { ...(soloActivos ? { activo: true } : {}), ...(filtro?.trim() ? { nombre: { contains: filtro.trim(), mode: "insensitive" } } : {}) }, orderBy: { nombre: "asc" } }),
            prisma.municipio.findMany({ orderBy: { nombre: "asc" } }),
            prisma.poblado.findMany({ orderBy: { nombre: "asc" } }),
            prisma.zonaUrbanizacion.findMany({ orderBy: { zona: "asc" } })
        ]);

        return successResponse({
            message: "Geografía obtenida correctamente",
            data: { estados, municipios, poblados, zonas },
            meta: { totalEstados: estados.length, totalMunicipios: municipios.length, totalPoblados: poblados.length, totalZonas: zonas.length }
        });
    } catch (error: any) {
        return errorResponse({ message: error.message || "Error al obtener la geografía" });
    }
};

export default getGeografia;
