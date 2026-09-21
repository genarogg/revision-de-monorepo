import {
    crearBitacora,
    successResponse,
    errorResponse,
    prisma,
    generarToken,
    compararContrasena,
    validarCapchat,
    log
} from "@fn";

import { AccionesBitacora } from "@prisma/client";

interface LoginUsuarioArgs {
    email: string;
    password: string;
    captchaToken?: string;
}

const loginUsuario = async (_: unknown, args: LoginUsuarioArgs) => {

    log.dev("Iniciando login de usuario", args);

     const { email, password, captchaToken } = args;

    if (!email || !password) {
        return errorResponse({ message: "Email y contraseña son obligatorios" });
    }

    // if (captchaToken) {
    //     const captchaValido = await validarCapchat(captchaToken);

    //     if (!captchaValido) {
    //         return errorResponse({ message: "Captcha inválido" });
    //     }
    // }

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario) {
            return errorResponse({ message: "Credenciales incorrectas" });
        }

        const passwordValida = await compararContrasena({
            password,
            hashedPassword: usuario.password
        });

        if (!passwordValida) {
            return errorResponse({ message: "Credenciales incorrectas" });
        }

        const token = generarToken({ id: usuario.id });

        await crearBitacora({
            usuarioId: usuario.id,
            type: AccionesBitacora.LOGIN
        });

        const data = {
            ...usuario,
            token
        }

        return successResponse({
            message: "Inicio de sesión exitoso",
            data
        });

    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return errorResponse({ message: "Error al iniciar sesión" });
    }
};

export default loginUsuario;
