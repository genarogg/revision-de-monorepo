# Arquitectura del proyecto

Monorepo gestionado con **pnpm workspaces** + **Turborepo**, con 4 paquetes principales: `backend`, `frontend`, `docs`, `lib`.

## backend/ — API (Fastify)

- Fastify 5 como servidor HTTP
- GraphQL vía **Mercurius**
- Prisma 7 como ORM — adapters para Postgres (`@prisma/adapter-pg`) y SQLite (`@prisma/adapter-better-sqlite3`)
- Auth con JWT (`jsonwebtoken`) + hashing con `argon2`
- Generación de PDFs con `@react-pdf-levelup/core`
- Emails con `nodemailer` + plantillas EJS
- Tareas programadas con `node-cron`
- Estructura interna: `src/controllers`, `src/graphql` (schema `.graphql` + resolvers por dominio), `src/pdf`, `src/email`, `src/tasks`, `src/seed`, `prisma/` (schema + migrations)

## frontend/ — Cliente (Next.js)

- Next.js 16 (App Router) + React 19
- UI: Tailwind CSS 4 + Radix UI + shadcn (`components.json` presente)
- Cliente GraphQL: Apollo Client
- Estado: Zustand
- Formularios: react-hook-form + zod
- Estructura: `app/` (rutas), `components/` (`nano`, `reutilizable`, `ui`, `ux`, `view`), `context/`, `query/`, `hooks/`, `providers/`

## docs/ — Documentación (Astro + Starlight)

- Astro 6 + `@astrojs/starlight` + tema `starlight-theme-nova`
- Contenido en `src/content/docs/` (`guides/`, `reference/`)
- Se sirve bajo el path `/docs`

## lib/ — Paquete compartido

- Librería TS empaquetada con `tsup`, publicable a npm (`pnpm run publicar`)
- Actualmente es una plantilla base (aún sin nombre definitivo)

## Infraestructura y scripts raíz

- `docker-compose-pg.yaml`: Postgres + pgAdmin para desarrollo local
- `turbo.json`: pipeline de `build`/`dev`/`lint` entre workspaces
- `script/envPropagation.js`: sincroniza el `.env` raíz hacia cada workspace
- `script/syncToModules.js`: sincroniza la carpeta `global/` (tipos y enums compartidos) hacia `frontend/global` y otros workspaces
- `global/`: tipos y enums compartidos entre backend y frontend (`enums.ts`, `prismaTypes.ts`)

## Notas

- `que-trasladar-de-nanify/`: componentes pendientes de migrar desde otro proyecto ("nanify")
- Antes de confiar en el `README.md` raíz para stack: está desactualizado (menciona Vite/Apollo Server en vez de Next.js/Mercurius)

