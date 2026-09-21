import { gql } from "@apollo/client";

const VALIDAR_SESION = gql`
  query ValidarSesion($token: String!) {
    validarSesion(token: $token) {
      data {
        token
        rol
        
      }
    }
  }
`;

export default VALIDAR_SESION;
