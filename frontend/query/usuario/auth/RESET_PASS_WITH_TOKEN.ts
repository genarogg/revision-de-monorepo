import { gql } from "@apollo/client";

const RESET_PASS_WITH_TOKEN = gql`
  mutation ResetPassWithToken($token: String!, $nuevaContrasena: String!) {
    resetPassWithToken(token: $token, nuevaContrasena: $nuevaContrasena) {
      message
      type
    }
  }
`;

export default RESET_PASS_WITH_TOKEN;
