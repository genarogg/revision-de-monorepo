import { gql } from "@apollo/client";

const VALIDAR_SESION = gql`
  query ValidarSesion($token: String!) {
    validarSesion(token: $token) {
      data {
        id
        primerNombre
        primerApellido
        avatar
        telefono
        cedula
        email
        rol
      }
    }
  }
`;

export default VALIDAR_SESION;
