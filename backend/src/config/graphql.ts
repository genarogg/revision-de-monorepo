import { readFileSync, readdirSync, createReadStream, existsSync } from 'node:fs'
import { join } from 'node:path'
import mercurius from 'mercurius'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import resolvers from '@/graphql/resolvers'

import generateEnumsSchema from '@/graphql/schema/enums'

function loadTypeDefs() {
    const dir = join(process.cwd(), 'src', 'graphql', 'schema')

    function getGraphqlFiles(currentDir: string): string[] {
        const entries = readdirSync(currentDir, { withFileTypes: true })
        const files: string[] = []

        for (const entry of entries) {
            const fullPath = join(currentDir, entry.name)
            if (entry.isDirectory()) {
                files.push(...getGraphqlFiles(fullPath))
            } else if (entry.isFile() && entry.name.endsWith('.graphql')) {
                files.push(fullPath)
            }
        }

        return files
    }

    const files = getGraphqlFiles(dir)
    let sdl = files
        .map((f) => readFileSync(f, 'utf8'))
        .join('\n')

    // Inyectar enums dinámicos
    const enumsSdl = generateEnumsSchema()
    sdl += '\n' + enumsSdl

    return sdl
}

// HTML del Apollo Sandbox embebido (standalone), apuntando al endpoint de Mercurius.
// Es el mismo componente visual que usaba ApolloServerPluginLandingPageLocalDefault()
// en Apollo Server, así que el playground se ve y se comporta igual que antes.
function apolloSandboxHtml(endpoint: string) {
    return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Apollo Sandbox</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; overflow: hidden; }
      #sandbox { height: 100vh; width: 100vw; }
    </style>
  </head>
  <body>
    <div id="sandbox"></div>
    <script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script>
    <script>
      new window.EmbeddedSandbox({
        target: "#sandbox",
        initialEndpoint: window.location.origin + "${endpoint}",
      });
    </script>
  </body>
</html>`
}

export async function registerGraphQL(app: FastifyInstance) {
    const typeDefs = loadTypeDefs()
    const graphqlPath = '/graphql'

    // routes:false evita que mercurius registre su propia ruta /graphql (con su
    // propio GraphiQL/landing), para poder montar nosotros una única ruta que:
    //  - en GET desde navegador (Accept: text/html) sirve el Apollo Sandbox
    //  - en POST/GET GraphQL ejecuta la operación vía app.graphql / reply.graphql
    await app.register(mercurius, {
        schema: typeDefs,
        resolvers,
        routes: false,
        graphiql: false,
        ide: false
    })

    app.route({
        method: ['GET', 'POST'],
        url: graphqlPath,
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            if (request.method === 'GET') {
                const accept = (request.headers.accept || '') as string
                const hasQueryParam = Boolean((request.query as any)?.query)
                if (accept.includes('text/html') && !hasQueryParam) {
                    reply.type('text/html').send(apolloSandboxHtml(graphqlPath))
                    return
                }
            }

            const body = (request.body || {}) as any
            const q = (request.query || {}) as any

            const query = body.query || q.query
            const variables = body.variables || (q.variables ? JSON.parse(q.variables) : undefined)
            const operationName = body.operationName || q.operationName

            return reply.graphql(query, undefined, variables, operationName)
        }
    })

    app.get('/uploads/:file', async (req, reply) => {
        const file = (req.params as any).file
        const filePath = join(process.cwd(), 'uploads', file)
        if (!existsSync(filePath)) {
            reply.code(404).send({ error: 'Not found' })
            return
        }
        reply.type('application/octet-stream').send(createReadStream(filePath))
    })
}
