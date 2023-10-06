// Core
import { FastifyPluginCallback } from 'fastify';
import {register, login, refreshToken, logout} from '../handlers/auth';
import FastifyAuth from '@fastify/auth';
import {findUserByToken} from '../utils/user';
import {assignGroup, getUserGroupChanges, getUserGroups} from '../handlers/user';

export const authRoute: FastifyPluginCallback = (fastify, _opts, done) => {
    fastify.decorate('asyncVerifyJWT', async (request, reply) => {
        try {
            if (!request.headers.authorization) {
                throw new Error('No token was sent');
            }
            const token = request.headers.authorization.replace('Bearer ', '');
            const user = await findUserByToken('access_token', token)
            if (!user) {
                throw new Error('Authentication failed!');
            }
            request.user = user;
        } catch (error) {
            reply.code(401).send(error);
        }
    }).decorate('asyncVerifyJWTRefresh', async (request, reply) => {
        try {
            if (!request.headers.authorization) {
                throw new Error('No token was sent');
            }
            const token = request.headers.authorization.replace('Bearer ', '');
            const user = await findUserByToken('refresh_token', token)
            if (!user) {
                throw new Error('Authentication failed!');
            }
            request.user = user;
        } catch (error) {
            reply.code(401).send(error);
        }
    }).register(FastifyAuth).after(() => {
        fastify.post('/register', register);
        fastify.post('/login', login);
        fastify.post('/refresh', { preHandler: fastify['auth']([fastify['asyncVerifyJWTRefresh']]) }, refreshToken)
        fastify.post('/user/assign-group', { preHandler: fastify['auth']([fastify['asyncVerifyJWT']]) }, assignGroup)
        fastify.get('/user/groups', { preHandler: fastify['auth']([fastify['asyncVerifyJWT']]) }, getUserGroups)
        fastify.get('/user/groups/changes',  { preHandler: fastify['auth']([fastify['asyncVerifyJWT']]) }, getUserGroupChanges)
        fastify.post('/logout', { preHandler: fastify['auth']([fastify['asyncVerifyJWT']]) }, logout)
    })

    done();
}
