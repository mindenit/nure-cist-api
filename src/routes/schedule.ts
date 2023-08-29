// Core
import { FastifyPluginCallback } from 'fastify';
import {getGroups, getScheduleByGroupName} from '../handlers/schedule';

export const scheduleRoute: FastifyPluginCallback = (fastify, _opts, done) => {
    fastify.get('/schedule/:groupId', getScheduleByGroupName);
    fastify.get('/groups', getGroups);
    done();
}