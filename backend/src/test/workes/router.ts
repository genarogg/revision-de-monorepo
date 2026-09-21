import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import os from 'os';

// PM2 asigna NODE_APP_INSTANCE a cada proceso/fork
const workerId = process.env.NODE_APP_INSTANCE ?? '0';
const workerPid = process.pid;
const workerTag = `Worker-${workerId} (PID ${workerPid})`;

const workerPingHandler = (request: FastifyRequest, reply: FastifyReply) => {
  console.log(`[${workerTag}] ← petición recibida en /api/workers/ping`);

  return reply.send({
    ok: true,
    worker: workerTag,
    workerId: workerId,
    pid: workerPid,
    host: os.hostname(),
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString(),
  });
};

const workerStressHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  console.log(`[${workerTag}] ← solicitud de stress recibida en /api/workers/stress`);

  // Tarea CPU-bound breve para poder observar qué worker la atiende
  const start = Date.now();
  let x = 0;
  for (let i = 0; i < 5_000_000; i++) x += Math.sqrt(i);
  const elapsed = Date.now() - start;

  console.log(`[${workerTag}] ✓ stress completado en ${elapsed}ms`);

  return reply.send({
    ok: true,
    worker: workerTag,
    result: x.toFixed(2),
    elapsed: `${elapsed}ms`,
  });
};

const router = async (fastify: FastifyInstance) => {
  fastify.get('/ping', workerPingHandler);
  fastify.get('/stress', workerStressHandler);
}

export default router;
