import {
    encriptarContrasena,
    crearBitacora,
    successResponse,
    errorResponse,
    prisma,
    generarToken,
    validarCapchat,
    log
} from "@fn";
import { AccionesBitacora, Rol } from "@prisma/client";

interface RegisterUsuarioArgs {
    primerNombre: string;
    primerApellido: string;
    telefono: string;
    cedula: string;
    email: string;
    password: string;
    captchaToken?: string;
}

const registerUsuario = async (_: unknown, args: RegisterUsuarioArgs) => {

    log.dev("Iniciando registro de usuario", args);

    const { primerNombre, primerApellido, telefono, cedula, email, password, captchaToken } = args;

    if (!primerNombre || !primerApellido || !telefono || !cedula || !email || !password) {
        return errorResponse({ message: "Todos los campos son obligatorios" });
    }

    // if (captchaToken) {
    //     const captchaValido = await validarCapchat(captchaToken);

    //     if (!captchaValido) {
    //         return errorResponse({ message: "Captcha inválido" });
    //     }
    // }
    // 
    try {
        const existe = await prisma.usuario.findUnique({ where: { email } });

        if (existe) {
            return errorResponse({ message: "El correo ya está registrado" });
        }

        const hashedPassword = await encriptarContrasena({ password });

        const nuevoUsuario = await prisma.usuario.create({
            data: {
                primerNombre,
                primerApellido,
                telefono,
                cedula,
                email,
                password: hashedPassword,
                rol: Rol.CLIENTE,
            },
            omit: { password: true }
        });

        await crearBitacora({
            usuarioId: nuevoUsuario.id,
            type: AccionesBitacora.CREATE_USER,
        });

        // Generar token para el nuevo usuario
        const tokenGenerado = generarToken({ id: nuevoUsuario.id });

        return successResponse({
            message: "Usuario registrado",
            data: {
                ...nuevoUsuario,
                token: tokenGenerado,
            },
        });
    } catch (error) {
        console.error("Error en el registro:", error);
        return errorResponse({ message: "Error al registrar usuario" });
    }
};

export default registerUsuario;