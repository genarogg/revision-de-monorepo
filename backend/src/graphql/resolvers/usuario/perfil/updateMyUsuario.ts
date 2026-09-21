import { AccionesBitacora } from "@prisma/client";
import {
    encriptarContrasena,
    verificarToken,
    prisma,
    successResponse,
    errorResponse,
    warningResponse,
    crearBitacora,
    log,
    uploadCloudinary
} from "@fn";

interface ActualizarMiUsuarioArgs {
    token: string;
    primerNombre?: string;
    primerApellido?: string;
    telefono?: string;
    cedula?: string;
    email?: string;
    password?: string;
    avatar?: string;
}

const updateMyUsuario = async (_: unknown, args: ActualizarMiUsuarioArgs) => {

    log.dev("updateMyUsuario called with args:", args);

    const { token, primerNombre, primerApellido, telefono, cedula, email, password, avatar } = args;

    if (!token) {
        return errorResponse({ message: "Token requerido" });
    }

    try {
        const usuario = await verificarToken(token);

        if (!usuario) {
            return errorResponse({ message: "Token inválido o expirado" });
        }

        const uploadResult = avatar ? await uploadCloudinary(avatar, "usuarios") : null;

        const actualizarData = {
            primerNombre,
            primerApellido,
            telefono,
            cedula,
            email,
            avatar: uploadResult?.url,
            password: password ? await encriptarContrasena({ password }) : undefined
        };

        if (Object.values(actualizarData).every((value) => value === undefined)) {
            return warningResponse({ message: "No se proporcionaron campos para actualizar" });
        }

        const usuarioActualizado = await prisma.usuario.update({
            where: { id: usuario.id },
            data: actualizarData,
            omit: {
                password: true
            }
        });

        await crearBitacora({
            usuarioId: usuario.id,
            type: AccionesBitacora.UPDATE_USER,
            mensaje: `El usuario ${usuario.email} actualizó su información`
        });

        return successResponse({
            message: "Datos actualizados correctamente",
            data: usuarioActualizado
        });
    } catch (error: any) {
        console.error(error);
        return errorResponse({ message: error.message || "Error al actualizar usuario" });
    }
};

export default updateMyUsuario;
