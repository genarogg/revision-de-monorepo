import { gql } from "@apollo/client";

const SEND_RESET_PASSWORD = gql`
  mutation resetSendEmail($email: String!) {
    resetSendEmail(email: $email) {
      message
      type
    }
  }
`;

export default SEND_RESET_PASSWORD;
