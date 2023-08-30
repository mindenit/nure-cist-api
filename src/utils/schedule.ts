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

// Interfaces
import { IDecodedSchedule } from '../interfaces/schedule';

export const getGroupById = async (groupId: number): Promise<Group> => {
    try {
        return await Group.findByPk(groupId);
    }
    catch (e) {
        console.log('[getGroupById]', e)
    }
}

export const getScheduleByGroupId = async (groupId: number, start_time: number, end_time: number): Promise<Event[]> => {
    try {
        return await Event.findAll({
            where: {
                start_time: {
                    [Op.gte]: start_time
                },
                end_time: {
                    [Op.lte]: end_time
                }
            },
            include: [
                {
                    model: Group,
                    where: {
                        id: groupId
                    },
                    include: [],
                    through: { attributes: [] }
                },
                {
                    model: Teacher,
                    include: [],
                    through: { attributes: [] }
                }
                ]
        })
    }
    catch (e) {
        console.log('[getScheduleByGroupId]', e)
    }
}

export const getEventsByGroupNameFromCist = async (groupId: number): Promise<IDecodedSchedule> => {
    try {
        const currentDate = new Date();

        const currentDayOfWeek = currentDate.getDay();
        const daysUntilMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - daysUntilMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const nextYear = currentDate.getFullYear() + 1;
        const septemberFirstNextYear = new Date(nextYear, 8, 1);

        const startOfWeekUnix = Math.floor(startOfWeek.getTime() / 1000);
        const septemberFirstNextYearUnix = Math.floor(septemberFirstNextYear.getTime() / 1000);

        console.log(`${env.API_URL}/P_API_EVEN_JSON?timetable_id=${groupId}&time_from=${startOfWeekUnix}&time_to=${septemberFirstNextYearUnix}&type_id=1&idClient=${env.API_KEY}`)
        const schedule = await fetch(`${env.API_URL}/P_API_EVEN_JSON?timetable_id=${groupId}&time_from=${startOfWeekUnix}&time_to=${septemberFirstNextYearUnix}&type_id=1&idClient=${env.API_KEY}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
            }
        })
        return JSON.parse(jsonrepair(iconv.decode(Buffer.from(await schedule.arrayBuffer()), 'win1251')));
    }
    catch (e) {
        console.log('[getEventsByGroupNameFromCist]', e)
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