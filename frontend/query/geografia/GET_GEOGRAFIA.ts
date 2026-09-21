import { gql } from "@apollo/client"

const GET_GEOGRAFIA = gql`
  query GetGeografia($token: String!, $filtro: String, $soloActivos: Boolean) {
    getGeografia(token: $token, filtro: $filtro, soloActivos: $soloActivos) {
      data {
        estados { id nombre activo createdAt updatedAt }
        municipios { id estadoId nombre vigencia }
        poblados { id municipioId nombre vigencia }
        zonas { id pobladoId codigoPostal zona vigencia }
      }
      message
      type
    }
  }
`

export default GET_GEOGRAFIA
