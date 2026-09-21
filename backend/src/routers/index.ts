import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

const controller = (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({ message: "Hello from the API!" });
}

const router = async (fastify: FastifyInstance) => {
    fastify.get('/', controller);
}

export default router;
