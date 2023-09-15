// Core
import { Op } from 'sequelize';

// Models
import { Event } from '../db/models/Event';
import { Auditory } from '../db/models/Auditory';

// Tools
import { calculateTimeForJobs, getEventsByIdFromCist, getScheduleByType, parseCistEvents } from '../utils/schedule';

export const auditoriesUpdate = async () => {
    try {
        const { fiveDaysAgo, startTimestamp, endTimestamp } = calculateTimeForJobs()

        const auditories = await Auditory.findAll({
            where: {
                isActive: true,
                lastRequest: {
                    [Op.gte]: fiveDaysAgo
                }
            }
        })

        for (const { name, id } of auditories) {
            const eventsFromCist = await getEventsByIdFromCist(id, 3)
            if (!eventsFromCist) {
                return;
            }
            const schedule = await getScheduleByType({ id: name, start_time: startTimestamp, end_time: endTimestamp, type: 'auditory' });
            schedule.map(async (el) => await Event.destroy({
                where: {
                    id: el.id
                }
            }))

            if (!schedule.length) {
                return;
            }
            await parseCistEvents({ eventsFromCist, type: 'auditory', id })
        }
    }
    catch (e) {
        console.log('[auditorysUpdate]', e)
    }
}
