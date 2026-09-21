import users from "../data/users.json"

export type GeographyRole = "ADMIN" | "EDITOR" | "READER"
export function getUserFromToken(token: string | null | undefined) {
  return users.find((user) => user.token === token) ?? null
}
export function canWrite(role: GeographyRole | string) { return role === "ADMIN" || role === "EDITOR" }
