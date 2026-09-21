// auth
import registerUsuario from "./auth/registerUsuario";
import loginUsuario from "./auth/loginUsuario";
import validarSesion from "./auth/validarSesion";

// recover
import resetSendEmail from "./recover/resetSendEmail";
import resetPassWithToken from "./recover/resetPassWithToken";

// admin usuarios
import getUsuarios from "./usuarios/getUsuarios";
import updateUsuarioAdmin from "./usuarios/updateUsuarioAdmin";
//perfil
import updateMyUsuario from "./perfil/updateMyUsuario";
import getMyUsuario from "./perfil/getMyUsuario";

const resolvers = {
    Query: {
        validarSesion,
        getUsuarios,
        getMyUsuario
    },

    Mutation: {
        registerUsuario,
        loginUsuario,
        resetSendEmail,
        resetPassWithToken,
        updateMyUsuario,
        updateUsuarioAdmin
    }
};

export default resolvers;