// Core
import { jsonrepair } from 'jsonrepair';
import iconv from 'iconv-lite';
import { Op } from 'sequelize';

// Config
import { env } from '../config';

// Models
import { Group } from '../db/models/Group';
import { Event, LessonType } from '../db/models/Event'
import { Teacher } from '../db/models/Teacher';
import { Subject } from '../db/models/Subject';

// Interfaces
import { IDecodedSchedule } from '../interfaces/schedule';
import { GroupEvent } from '../db/models/GroupEvent';
import { TeacherEvent } from '../db/models/TeacherEvent';
import { Auditory } from '../db/models/Auditory';
export const getGroupById = async (groupId: number): Promise<Group> => {
    try {
        return await Group.findByPk(groupId);
    }
    catch (e) {
        console.log('[getGroupById]', e)
    }
}

export const getTeacherById = async (teacherId: number): Promise<Teacher> => {
    try {
        return await Teacher.findByPk(teacherId);
    }
    catch (e) {
        console.log('[getTeacherById]', e)
    }
}

export const getAuditoryById = async (auditoryId: number): Promise<Auditory> => {
    try {
        return await Auditory.findByPk(auditoryId)
    }
    catch (e) {
        console.log('[getAuditoryById]', e)
    }
}

interface IScheduleTypePayload {
    id: number | string;
    type: string;
    start_time: number;
    end_time: number;
    isDeleted: boolean;
    attr?: string[]
}

export const getScheduleByType = async ({id, start_time, end_time, type, isDeleted}: IScheduleTypePayload): Promise<Event[]> => {
    try {
        return Event.findAll({
            where: {
                start_time: {
                    [Op.gte]: start_time
                },
                end_time: {
                    [Op.lte]: end_time
                },
                isDeleted,
                ...(type === 'auditory' ? { auditory: id  } : null),
            },
            attributes: {
              exclude: ['isDeleted']
            },
            include: [
                {
                    model: Group,
                    where: {
                        ...(type === 'group' ? { id } : null )
                    },
                    include: [],
                    attributes: {
                        exclude: ['lastRequest', 'isActive'],
                    },
                    duplicating: false,
                    through: { attributes: [] }
                },
                {
                    model: Teacher,
                    required: false,
                    where: {
                        ...(type === 'teacher' ? { id } : null )

                    },
                    attributes: {
                        exclude: ['lastRequest', 'isActive'],
                    },
                    include: [],
                    through: { attributes: [] }
                },
                {
                    model: Subject
                }
            ],
            order: [['updatedAt', 'DESC']],
        })
    }
    catch (e) {
        console.log('[getScheduleByGroupId]', e)
    }
}

export const getEventsByIdFromCist = async (id: number, typeId: number): Promise<IDecodedSchedule> => {
    let schedule;
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const septemberFirstCurrentYear = new Date(currentYear, 8, 1); // 8 представляет сентябрь (январь - 0, февраль - 1, и так далее)

        const currentDayOfWeek = currentDate.getDay();
        const daysUntilMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - daysUntilMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfWeekUnix = Math.floor(startOfWeek.getTime() / 1000);
        const septemberFirstCurrentYearUnix = Math.floor(septemberFirstCurrentYear.getTime() / 1000);

        schedule = await fetch(`${env.API_URL}/P_API_EVEN_JSON?timetable_id=${id}&time_from=${startOfWeekUnix}&time_to=${septemberFirstCurrentYearUnix}&type_id=${typeId}&idClient=${env.API_KEY}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
            }
        })

        if (schedule.status >= 500) {
            return;
        }

        return JSON.parse(jsonrepair(iconv.decode(Buffer.from(await schedule.arrayBuffer()), 'win1251')));
    }
    catch (e) {
        console.log('[getEventsByIdFromCist]', e)
        return JSON.parse(await schedule.json())
    }
}

export const getLessonType = (id: number): LessonType => {
    switch (id) {
        case 10:
        case 12:
            return LessonType.Pz;

        case 20:
        case 21:
        case 22:
        case 23:
        case 24:
            return LessonType.Lb;

        case 30:
            return LessonType.Cons;

        case 40:
        case 41:
            return LessonType.Zal;

        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
            return LessonType.Ekz;

        case 60:
            return LessonType.KpKr;

        default:
            return LessonType.Lk;
    }
}

export interface IParserCistEventsPayload {
    type: string;
    eventsFromCist: IDecodedSchedule
    id: number
}

const handleCisEventsByGroup = async (teachers: number[], groupId: number, eventId: number) => {
    try {
        for (const teacher of teachers) {
            await TeacherEvent.create({
                eventId: eventId,
                teacherId: teacher
            })
        }

        await GroupEvent.create({
            eventId: eventId,
            groupId,
        })
    }
    catch (e) {
        console.log('[handleCisEventsByGroup]', e)
    }
}

const handleCistEventByTeacher = async (groups: number[], teacherId: number, eventId: number) => {
    try {
        for (const group of groups) {
            await GroupEvent.create({
                eventId: eventId,
                groupId: group,
            })
        }

        await TeacherEvent.create({
            eventId: eventId,
            teacherId,
        })
    }
    catch (e) {
        console.log('[handleCistEventByTeacher]', e)
    }
}

const handleCistEventByAudotory = async (groups: number[], auditoryId: number, eventId: number, teachers: number[]) => {
    try {
        for (const group of groups) {
            const findingGroup = await Group.findByPk(group);
            const findingEvent = await GroupEvent.findOne({
                where: {
                    eventId,
                    groupId: group
                }
            })
            if (findingGroup && !findingEvent) {
                await GroupEvent.create({
                    eventId: eventId,
                    groupId: group,
                })
            }
        }

        for (const teacher of teachers) {
            const findingTeacher = await Teacher.findByPk(teacher);
            const findingEvent = await TeacherEvent.findOne({
                where: {
                    eventId,
                    teacherId: teacher
                }
            })
            if (findingTeacher && !findingEvent) {
                await TeacherEvent.create({
                    eventId: eventId,
                    teacherId: teacher
                })
            }
        }
    }
    catch (e) {
        console.log('[handleCistEventByteacher]', e)
    }
}

export const handleCistEventsByType = async (type: string) => {
    return async (groups: number[], id: number, eventId: number, teachers: number[]) => {
        switch (type) {
            case 'group':
                await handleCisEventsByGroup(teachers, id, eventId);
                break;
            case 'teacher':
                await handleCistEventByTeacher(groups, id, eventId);
                break;
            case 'auditory':
                await handleCistEventByAudotory(groups, id, eventId, teachers)
                break;
        }
    }
}

export const parseCistEvents = async ({ eventsFromCist, id, type: incomingType}: IParserCistEventsPayload) => {
    if (eventsFromCist?.subjects && eventsFromCist.subjects.length !== 0) {
        for (const subject of eventsFromCist.subjects) {
            await Subject.findOrCreate({
                where: {
                    id: subject.id,
                    brief: subject.brief,
                    title: subject.title
                }
            });
        }
    }

    if (eventsFromCist?.events && eventsFromCist.events.length !== 0) {
        for (const { number_pair, end_time, start_time, subject_id, groups, type, auditory, teachers } of  eventsFromCist.events) {
            const newEvent = await Event.create({
                number_pair,
                end_time,
                start_time,
                subjectId: subject_id,
                auditory,
                type: getLessonType(type)
            })

            await (await handleCistEventsByType(incomingType))(groups, id, newEvent.id, teachers);
        }
    }
}

export const calculateTimeForJobs = () => {
    const currentDate = new Date();

    const daysUntilMonday = (1 - currentDate.getDay() + 7) % 7;

    const previousMonday = new Date(currentDate);
    previousMonday.setDate(currentDate.getDate() - daysUntilMonday);

    const startTimestamp = Math.floor(previousMonday.getTime() / 1000);

    const daysUntilNextMonday = (8 - currentDate.getDay()) % 7;

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() + daysUntilNextMonday);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 14);

    const endTimestamp = Math.floor(endOfWeek.getTime() / 1000);

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    return { startTimestamp, endTimestamp, fiveDaysAgo }
}

export const findDifference = (arr1: object[], arr2: object[]): object => {
    const difference: object = {
        newLessons: [],
        canceledLessons: [],
    }
    for (const obj1 of arr1) {
        for (const obj2 of arr2) {
            if (obj1['start_time'] === obj2['start_time'] && obj1['end_time'] === obj2['end_time']) {
                if (obj1['groups'][0]['name'] !== obj2['groups'][0]['name'] || obj1['subject']['brief'] !== obj2['subject']['brief']) {
                    difference['newLessons'].push(obj2)
                    difference['canceledLessons'].push(obj1)
                } else if (obj1['number_pair'] !== obj2['number_pair']) {
                    difference['newLessons'].push(obj2)
                    difference['canceledLessons'].push(obj1)
                } else if (obj1['type'] !== obj2['type']) {
                    difference['newLessons'].push(obj2)
                    difference['canceledLessons'].push(obj1)
                }
            }
        }
    }

    return difference
}
