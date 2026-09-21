import type { FastifyInstance } from "fastify"
import underPressure from '@fastify/under-pressure';
import { monitorEventLoopDelay } from 'perf_hooks';

const loopMonitor = monitorEventLoopDelay({ resolution: 20 });
loopMonitor.enable();

const underPressureFastify = (server: FastifyInstance) => {
    const result = server.register(underPressure, {
        maxEventLoopDelay : 1500,
        message           : 'Under pressure!',
        retryAfter        : 50,
        exposeStatusRoute : '/internal/pressure', // ← string directo
    });

    server.get('/internal/health', {
        config: { skip: true },
    }, (_req, reply) => {
        const lagMs = loopMonitor.mean / 1e6;
        const memMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

        return reply.send({
            pid     : process.pid,
            workerId: process.env.NODE_APP_INSTANCE ?? '0',
            lagMs   : parseFloat(lagMs.toFixed(2)),
            memMB,
            uptime  : Math.floor(process.uptime()),
        });
    });

    return result;
}

export default underPressureFastify;