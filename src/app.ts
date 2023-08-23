// Core
import fastify, { FastifyServerOptions } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import sensible from '@fastify/sensible'

export const createApp = (opts?: FastifyServerOptions) => {
    const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();

    app.register(sensible);

    return app
}