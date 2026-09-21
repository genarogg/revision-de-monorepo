import Fastify, { FastifyInstance } from 'fastify'
import Table from 'cli-table3';
import clear from "console-clear";
import chalk from "chalk";
import dotenv from 'dotenv';

dotenv.config({ debug: false });

const { BACKEND_PORT, NODE_ENV } = process.env;

const server: FastifyInstance = Fastify()

import {
  dbConection,
  caching,
  helmet,
  rateLimit,
  underPressureFastify,
  corsFastify,
  compressFastify,
  multipart,
  graphql,
  slowDownFastify
} from "./src/config"

const PRODUCTIONS = NODE_ENV === "production"

console.log("PRODUCTIONS", NODE_ENV)

const registerPlugins = async () => {
  if (PRODUCTIONS) {
    await underPressureFastify(server);
    await caching(server);
    await rateLimit(server);
    await slowDownFastify(server);
  }

  await helmet(server);
  await corsFastify(server);
  await compressFastify(server);

  await multipart(server);
  await graphql(server);
}

import tack from "@/tasks"
import seed from "@/seed"
import router from '@/routers';
import routerWorkes from '@/test/workes/router';

(async () => {
  clear();
  try {
    await registerPlugins()
    server.register(router, { prefix: '/' })
    server.register(router, { prefix: '/api' })

    server.register(routerWorkes, { prefix: '/workers' })
    server.register(routerWorkes, { prefix: '/api/workers' })

    const port = Number(BACKEND_PORT) || 4000
    const dbStatus = await dbConection() || "";
    await server.listen({ port, host: '0.0.0.0' });

    const tableURL = new Table({
      head: ['Servicio', 'URL'],
      colWidths: [20, 50]
    });

    const tableInfo = new Table({
      head: ['nombre', 'Status'],
      colWidths: [20, 50]
    });
// 
    tack()
    const semilla = await seed()

    tableURL.push(
      ['Servidor', chalk.green(`http://localhost:${port}`)],
      ['Graphql', chalk.green(`http://localhost:${port}/graphql`)],
      ["Rest API", chalk.green(`http://localhost:${port}/api`)],
    );

    tableInfo.push(
      ["db estatus", chalk.cyan(dbStatus)],
      ["semilla", chalk.cyan(semilla as string)],
      ["PRODUCTION", chalk.cyan(PRODUCTIONS + "")],
    )
console.log("reinicio")
    console.log(tableURL.toString());
    console.log(tableInfo.toString());
  } catch (err) {
    console.log(err)
  }
})();

export default server;