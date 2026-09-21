import { gql } from "@apollo/client"

const GET_GEOGRAFIA = gql`
  query GetGeografia($token: String!, $filtro: String, $soloActivos: Boolean) {
    getGeografia(token: $token, filtro: $filtro, soloActivos: $soloActivos) {
      data {
        estados {
          id
          nombre
          activo
          createdAt
          updatedAt
        }
      }
      message
      type
    }
  }
`

export default GET_GEOGRAFIA
