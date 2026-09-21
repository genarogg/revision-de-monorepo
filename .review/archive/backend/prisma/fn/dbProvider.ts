import 'dotenv/config'

export type DbProvider = 'sqlite' | 'postgresql'

export function detectProviderFromUrl(url: string): DbProvider {
  const u = url.toLowerCase()
  if (u.startsWith('file:')) return 'sqlite'
  if (u.startsWith('postgres://') || u.startsWith('postgresql://') || u.startsWith('prisma+postgres://')) {
    return 'postgresql'
  }
  return 'sqlite'
}

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL ??
  ''

// The Prisma schema is PostgreSQL-backed. When the runtime injects the Neon
// variables after the process starts, an empty shell value must not make the
// client select the SQLite adapter.
export const dbProvider: DbProvider = databaseUrl
  ? detectProviderFromUrl(databaseUrl)
  : 'postgresql'
