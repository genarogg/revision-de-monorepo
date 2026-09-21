import {
    successResponse,
    errorResponse,
    verificarToken,
    log
} from "@fn";


interface ArgsObtenerUsuarioToken {
    token: string;
}

const getMyUsuario = async (_: unknown, args: ArgsObtenerUsuarioToken) => {
    log.dev("getMyUsuario called with args:", args);

    const { token } = args;

    if (!token) {
        return errorResponse({ message: "Token requerido" });
    }

    try {
        // Verificar y decodificar token
        const usuario = await verificarToken(token);

        if (!usuario) {
            return errorResponse({ message: "Usuario no encontrado" });
        }

        return successResponse({
            message: "Usuario obtenido correctamente",
            data: usuario
        });

    } catch (error) {
        console.error("Error al obtener usuario desde token:", error);
        return errorResponse({ message: "Error al obtener usuario" });
    }
};

export default getMyUsuario;
