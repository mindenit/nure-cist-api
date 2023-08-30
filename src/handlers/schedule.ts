// Core
import { FastifyReply, FastifyRequest } from 'fastify';

// Tools
import {
    getEventsByGroupNameFromCist,
    getGroupById,
    getLessonType,
    getScheduleByGroupId
} from '../utils/schedule';

// Interfaces
import { IScheduleQueries } from '../interfaces/schedule';

// Models
import { Subject } from '../db/models/Subject';
import { Event } from '../db/models/Event'
import { TeacherEvent } from '../db/models/TeacherEvent';
import { GroupEvent } from '../db/models/GroupEvent';
import { Group } from '../db/models/Group';

export const getScheduleByGroupName = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        const { start_time, end_time, groupId } = <IScheduleQueries>_req.query

        // const typeId = type === 'group' ? 1 : type === 'teacher' ? 2 : 3;

        const findingGroup = await getGroupById(groupId);

        if (!findingGroup) {
            return res.notFound('Invalid group id')
        }

        const schedule = await getScheduleByGroupId(findingGroup.id, start_time, end_time);

        if (schedule.length !== 0) {
            res.code(200);
            return res.send(schedule);
        }

        const eventsFromCist = await getEventsByGroupNameFromCist(findingGroup.id);
        console.log(eventsFromCist)
        for (const subject of eventsFromCist.subjects) {
            await Subject.findOrCreate({
                where: {
                    id: subject.id,
                    brief: subject.brief,
                    title: subject.title
                }
            });
        }

        for (const { number_pair, end_time, start_time, subject_id, type, auditory, teachers } of  eventsFromCist.events) {
            const newEvent = await Event.create({
                number_pair,
                end_time,
                start_time,
                subjectId: subject_id,
                auditory,
                type: getLessonType(type)
            })

            for (const teacher of teachers) {
                await TeacherEvent.create({
                    eventId: newEvent.id,
                    teacherId: teacher
                })
            }

            await GroupEvent.create({
                eventId: newEvent.id,
                groupId: findingGroup.id
            })
        }
        res.code(200);
        return res.send(await getScheduleByGroupId(findingGroup.id, start_time, end_time))

    }
    catch (e) {
        console.log('[getScheduleByGroupName]', e)
        return res.internalServerError('Internal server error');
    }
}

export const getGroups = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        const groups = await Group.findAll();

        return res.code(200).send(groups);
    }
    catch (e) {
        console.log('[getGroups]', e)
        return res.internalServerError('Internal server error');
    }
}