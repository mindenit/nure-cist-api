// Core
import { FastifyReply, FastifyRequest } from 'fastify';
import {Group} from '../db/models/Group';
import {UserGroup} from '../db/models/UserGroup';
import {User} from '../db/models/User';
import {Change} from '../db/models/Change';
import {Op} from 'sequelize';

export const assignGroup = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        const { groupId} = <{groupId: number}>_req.body

        const group = await Group.findByPk(groupId);

        if (!group) {
            res.notFound('Group does not exist')
            return;
        }

        const { id: userId } = _req['user']
        await UserGroup.create({
            userId,
            groupId,
        })

        res.code(200)
        return res.send(JSON.stringify({}, null, 2))

    } catch (e) {
        console.log('[assignGroup]', e)
        return res.internalServerError('Internal server error');
    }
}

export const getUserGroups = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        console.log(_req['user'])
        const userGroups = await User.findOne({
            where: {
                id: _req['user'].id
            },
            attributes: {
                exclude: ['password']
            },
            include: {
                model: Group,
                include: [],
                attributes: {
                    exclude: ['isActive', 'lastRequest']
                },
                through: { attributes: [] }
            }
        })

        console.log(userGroups)

        res.code(200)
        return res.send(JSON.stringify({ groups:  userGroups.groups }, null, 2))
    } catch (e) {
        console.log('[getUserGroups]', e)
        return res.internalServerError('Internal server error');

    }
}

export const getUserGroupChanges = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        const userGroups = await User.findOne({
            where: {
                id: _req['user'].id
            },
            attributes: {
                exclude: ['password']
            },
            include: {
                model: Group,
                include: [],
                through: { attributes: [] }
            }
        })

        const arrayOfIds = userGroups.groups.map(obj => obj.id);

        const changes = await Change.findAll({
            where: {
                groupId: {
                    [Op.in]: arrayOfIds
                }
            }
        })

        res.code(200)
        return res.send(JSON.stringify(changes, null, 2))
    } catch (e) {
        console.log('[getUserGroups]', e)
        return res.internalServerError('Internal server error');

    }
}
