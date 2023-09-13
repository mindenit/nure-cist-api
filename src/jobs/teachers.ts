// Core
import { Op } from 'sequelize';

// Models
import { Event } from '../db/models/Event';
import { Teacher } from '../db/models/Teacher';

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
            const schedule = await getScheduleByType({ id, start_time: startTimestamp, end_time: endTimestamp, type: 'teacher' });
            schedule.map(async (el) => await Event.destroy({
                where: {
                    id: el.id
                }
            }))
            await parseCistEvents({ eventsFromCist, type: 'teacher', id })
        }
    }
    catch (e) {
        console.log('[teachersUpdate]', e)
    }
}
