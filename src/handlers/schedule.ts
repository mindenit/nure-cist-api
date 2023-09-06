// Core
import { FastifyReply, FastifyRequest } from 'fastify';

// Tools
import {
    checkTimeDifference,
    getAuditoryById,
    getEventsByIdFromCist,
    getGroupById,
    getScheduleByType,
    getTeacherById,
    parseCistEvents,
} from '../utils/schedule';

// Interfaces
import { IScheduleQueries } from '../interfaces/schedule';

// Models
import { Group } from '../db/models/Group';
import { Teacher } from '../db/models/Teacher';
import { Auditory } from '../db/models/Auditory';
import { Event } from '../db/models/Event'

export const getScheduleByTypeAndid = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        const { start_time, end_time, id, type } = <IScheduleQueries>_req.query

        const typeId = type === 'group' ? 1 : type === 'teacher' ? 2 : 3;

        if (typeId === 1) {
            const findingGroup = await getGroupById(id);

            if (!findingGroup) {
                return res.notFound(`Invalid ${type} id`)
            }

            const schedule = await getScheduleByType({ id, start_time, end_time, type, attr: ['createdAt'] });
            if (schedule.length !== 0) {
                if (await checkTimeDifference(schedule[0])) {
                    schedule.map(async (el) => await Event.destroy({
                        where: {
                            id: el.id
                        }
                    }))
                    const eventsFromCist = await getEventsByIdFromCist(id, typeId);

                    await parseCistEvents({ eventsFromCist, type, id })
                    res.code(200);
                    return res.send(JSON.stringify(await getScheduleByType({ id, start_time, end_time, type }), null, 2))
                }
                res.code(200);
                return res.send(JSON.stringify(schedule, null, 2));
            }
        }

        if (typeId === 2) {
            const findingTeacher = await getTeacherById(id);

            if (!findingTeacher) {
                return res.notFound(`Invalid ${type} id`)
            }

            const schedule = await getScheduleByType({ id, start_time, end_time, type });

            if (schedule.length !== 0) {
                if (await checkTimeDifference(schedule[0])) {
                    schedule.map(async (el) => await Event.destroy({
                        where: {
                            id: el.id
                        }
                    }))
                    const eventsFromCist = await getEventsByIdFromCist(id, typeId);

                    await parseCistEvents({ eventsFromCist, type, id })
                    res.code(200);
                    return res.send(JSON.stringify(await getScheduleByType({ id, start_time, end_time, type }), null, 2))
                }
                res.code(200);
                return res.send(JSON.stringify(schedule, null, 2));
            }
        }

        if (typeId === 3) {
            const findingAuditory = await getAuditoryById(id);

            if (!findingAuditory) {
                return res.notFound(`Invalid ${type} id`)
            }

            const schedule = await getScheduleByType({ id: findingAuditory.name, start_time, end_time, type });

            if (schedule.length !== 0) {
                if (await checkTimeDifference(schedule[0])) {
                    schedule.map(async (el) => await Event.destroy({
                        where: {
                            id: el.id
                        }
                    }))
                    const eventsFromCist = await getEventsByIdFromCist(id, typeId);

                    await parseCistEvents({ eventsFromCist, type, id })
                    res.code(200);
                    return res.send(JSON.stringify(await getScheduleByType({ id: findingAuditory.name, start_time, end_time, type }), null, 2))
                }
                res.code(200);
                return res.send(JSON.stringify(schedule, null, 2));
            }

            const eventsFromCist = await getEventsByIdFromCist(id, typeId);

            await parseCistEvents({ eventsFromCist, type, id })
            res.code(200);
            return res.send(JSON.stringify(await getScheduleByType({ id: findingAuditory.name, start_time, end_time, type }), null, 2))
        }

        const eventsFromCist = await getEventsByIdFromCist(id, typeId);

        await parseCistEvents({ eventsFromCist, type, id })
        res.code(200);
        const response = await getScheduleByType({ id, start_time, end_time, type })
        return res.send(JSON.stringify(response, null, 2))

    }
    catch (e) {
        console.log('[getScheduleByGroupName]', e)
        return res.internalServerError('Internal server error');
    }
}

export const getGroups = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        const groups = await Group.findAll();

        return res.code(200).send(JSON.stringify(groups, null, 2));
    }
    catch (e) {
        console.log('[getGroups]', e)
        return res.internalServerError('Internal server error');
    }
}

export const getTeachers = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        const teachers = await Teacher.findAll();

        return res.code(200).send(JSON.stringify(teachers, null, 2));
    }
    catch (e) {
        console.log('[getTeachers]', e)
        return res.internalServerError('Internal server error');
    }
}

export const getAuditories = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        const auditories = await Auditory.findAll();

        return res.code(200).send(JSON.stringify(auditories, null, 2));
    }
    catch (e) {
        console.log('[getAuditories]', e)
        return res.internalServerError('Internal server error');
    }
}
