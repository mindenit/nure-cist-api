// Core
import fastify, { FastifyServerOptions } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';

export const createApp = (opts?: FastifyServerOptions) => {
    const app = fastify(opts).withTypeProvider<TypeBoxTypeProvider>();


    app.register(swagger, {
        openapi: {
            info: {
                title: 'Fastify Template',
                description: 'Swagger Spec for Fastify web API',
                version: '0.1.0',
            },
            servers: [{ url: 'http://localhost:3000' }],
        },
        refResolver: {
            buildLocalReference(json, baseUri, fragment, i) {
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                return json.$id?.toString() || `def-${i}`;
            },
        },
    });
    app.register(sensible);

    return app
}