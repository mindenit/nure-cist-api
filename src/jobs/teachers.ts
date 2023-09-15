// Core
import { Op } from 'sequelize';

// Models
import { Event } from '../db/models/Event';
import { Teacher } from '../db/models/Teacher';
import { TeacherEvent } from '../db/models/TeacherEvent';


// Tools
import {calculateTimeForJobs, getEventsByIdFromCist, getScheduleByType, parseCistEvents} from '../utils/schedule';
export const teachersUpdate = async () => {
    try {
        const { fiveDaysAgo, startTimestamp, endTimestamp } = calculateTimeForJobs()

        const teachers = await Teacher.findAll({
            where: {
                isActive: true,
                lastRequest: {
                    [Op.gte]: fiveDaysAgo
                }
            }
        })

        for (const { id } of teachers) {
            const eventsFromCist = await getEventsByIdFromCist(id, 2)
            if (!eventsFromCist) {
                return;
            }
            const schedule = await getScheduleByType({ id, start_time: startTimestamp, end_time: endTimestamp, type: 'teacher' });
            schedule.map(async (el) => await Event.destroy({
                where: {
                    id: el.id
                }
            }))

            for (const { id } of schedule) {
                await TeacherEvent.destroy({
                    where: {
                        eventId: id
                    }
                })
            }

            if (!schedule.length) {
                return;
            }
            await parseCistEvents({ eventsFromCist, type: 'teacher', id })
        }
    }
    catch (e) {
        console.log('[teachersUpdate]', e)
    }
}
