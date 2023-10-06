// Core
import {Op} from 'sequelize';

// Models
import {Event} from '../db/models/Event';
import {Group} from '../db/models/Group';

// Tools
import {
    calculateTimeForJobs,
    findDifference,
    getEventsByIdFromCist,
    getScheduleByType,
    parseCistEvents
} from '../utils/schedule';
import {Change} from '../db/models/Change';

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
            const deletedSchedule = await getScheduleByType({ id, start_time: startTimestamp, end_time: endTimestamp, type: 'group', isDeleted: true, })

            deletedSchedule.map(async (el) => {
                await Event.destroy({
                    where: {
                        id: el.id
                    }
                })
            })
            const schedule = await getScheduleByType({ id, start_time: startTimestamp, end_time: endTimestamp, type: 'group', isDeleted: false });
            schedule.map(async (el) => await Event.update({
                isDeleted: true,
            },{
                where: {
                    id: el.id
                }
            }))

            if (!schedule.length) {
                return;
            }

            await parseCistEvents({ eventsFromCist, type: 'group', id })

            const newSchedule = await getScheduleByType({ id, start_time: startTimestamp, end_time: endTimestamp, type: 'group', isDeleted: false })
            const difference = findDifference(schedule, newSchedule)

            for (const newPair of difference['newLessons']) {
                await Change.findOrCreate({
                    where: {
                        start_time: newPair['start_time'],
                        end_time: newPair['end_time'],
                        number_pair: newPair['number_pair'],
                        type: newPair['type'],
                        typeChange: 'NEW',
                        subjectId: newPair['subject']['id'],
                        groupId: id,
                    },
                    defaults: {
                        start_time: newPair['start_time'],
                        end_time: newPair['end_time'],
                        auditory: newPair['auditory'],
                        number_pair: newPair['number_pair'],
                        type: newPair['type'],
                        typeChange: 'NEW',
                        subjectId: newPair['subject']['id'],
                        groupId: id
                    }
                })
            }

            for (const canceledPair of difference['canceledLessons']) {
                await Change.findOrCreate({
                    where: {
                        start_time: canceledPair['start_time'],
                        end_time: canceledPair['end_time'],
                        number_pair: canceledPair['number_pair'],
                        type: canceledPair['type'],
                        typeChange: 'OLD',
                        subjectId: canceledPair['subject']['id'],
                        groupId: id,
                    },
                    defaults: {
                        start_time: canceledPair['start_time'],
                        end_time: canceledPair['end_time'],
                        auditory: canceledPair['auditory'],
                        number_pair: canceledPair['number_pair'],
                        type: canceledPair['type'],
                        typeChange: 'OLD',
                        subjectId: canceledPair['subject']['id'],
                        groupId: id,
                    }
                })
            }


        }
    }
    catch (e) {
        console.log('[groupsUpdate]', e)
    }
}
