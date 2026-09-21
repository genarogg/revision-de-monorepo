import { gql } from "@apollo/client"

export const CREATE_MUNICIPIO = gql`
  mutation CreateMunicipio($token: String!, $estadoId: Int!, $nombre: String!, $vigencia: Boolean) {
    createMunicipio(token: $token, estadoId: $estadoId, nombre: $nombre, vigencia: $vigencia) {
      data { id estadoId nombre vigencia }
      message
      type
    }
  }
`

export const UPDATE_MUNICIPIO = gql`
  mutation UpdateMunicipio($token: String!, $id: Int!, $estadoId: Int, $nombre: String, $vigencia: Boolean) {
    updateMunicipio(token: $token, id: $id, estadoId: $estadoId, nombre: $nombre, vigencia: $vigencia) {
      data { id estadoId nombre vigencia }
      message
      type
    }
  }
`
