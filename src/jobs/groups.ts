// Core
import { Op } from 'sequelize';

// Models
import { Event } from '../db/models/Event';
import { Group } from '../db/models/Group';

// Tools
import {calculateTimeForJobs, getEventsByIdFromCist, getScheduleByType, parseCistEvents} from '../utils/schedule';

export const groupsUpdate = async () => {
    try {
        const { fiveDaysAgo, startTimestamp, endTimestamp } = calculateTimeForJobs()

        const groups = await Group.findAll({
            where: {
                isActive: true,
                lastRequest: {
                    [Op.gte]: fiveDaysAgo
                }
            }
        })

        for (const { id } of groups) {
            const eventsFromCist = await getEventsByIdFromCist(id, 1,)
            if (!eventsFromCist) {
                return;
            }
            const schedule = await getScheduleByType({ id, start_time: startTimestamp, end_time: endTimestamp, type: 'group' });
            schedule.map(async (el) => await Event.destroy({
                where: {
                    id: el.id
                }
            }))
            await parseCistEvents({ eventsFromCist, type: 'group', id })
        }
    }
    catch (e) {
        console.log('[groupsUpdate]', e)
    }
}
