import { gql } from "@apollo/client"

export const CREATE_ESTADO = gql`
  mutation CreateEstado($token: String!, $nombre: String!, $activo: Boolean) {
    createEstado(token: $token, nombre: $nombre, activo: $activo) {
      data { id nombre activo createdAt updatedAt }
      message
      type
    }
  }
`

export const UPDATE_ESTADO = gql`
  mutation UpdateEstado($token: String!, $id: Int!, $nombre: String, $activo: Boolean) {
    updateEstado(token: $token, id: $id, nombre: $nombre, activo: $activo) {
      data { id nombre activo createdAt updatedAt }
      message
      type
    }
  }
`
