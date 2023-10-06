// Core
import { FastifyPluginCallback } from 'fastify';
import {getGroups, getScheduleByTypeAndid, getTeachers, getAuditories, getChanges} from '../handlers/schedule';

export const scheduleRoute: FastifyPluginCallback = (fastify, _opts, done) => {
    fastify.get('/schedule', getScheduleByTypeAndid);
    fastify.get('/groups', getGroups);
    fastify.get('/teachers', getTeachers);
    fastify.get('/auditories', getAuditories);
    fastify.get('/changes', getChanges)

    done();
}
