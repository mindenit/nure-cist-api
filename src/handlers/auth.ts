// Core
import { FastifyReply, FastifyRequest } from 'fastify';
import {IRegisterPayload} from '../interfaces/auth';
import {findUserByEmail, updateUser} from '../utils/user';
import bcrypt from 'bcrypt'
import {User} from '../db/models/User';
import {generateTokens} from '../utils/auth';

export const register = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        const { password, email} = <IRegisterPayload>_req.body

        const user = await findUserByEmail(email);
        if (user) {
            return res.badRequest('User with that email already exists')
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            email,
            password: hashedPassword
        })

        res.code(201)
        return res.send(JSON.stringify(newUser, null, 2))

    } catch (e) {
        console.log('[register]', e)
        return res.internalServerError('Internal server error');
    }
}

export const login = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        const { password, email} = <IRegisterPayload>_req.body

        const user = await findUserByEmail(email);
        if (!user) {
            return res.notFound('User does not exist')
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password)

        if (!isCorrectPassword) {
            return res.badRequest('Wrong password')
        }

        const tokens = await generateTokens({ id: user.id })
        await updateUser(user.id, tokens)

        res.code(200)
        return res.send(JSON.stringify(tokens, null, 2))
    } catch (e) {
        console.log('[login]', e)
        return res.internalServerError('Internal server error');
    }
}


export const refreshToken = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        const user = await User.findByPk(_req['user'].id)
        const tokens = await generateTokens({ id: user.id })
        await User.update(tokens, {
            where: {
                id: user.id
            }
        })
        res.code(200)
        return res.send(JSON.stringify(tokens, null, 2))
    } catch (e) {
        console.log('[refreshToken]', e)
        return res.internalServerError('Internal server error');
    }
}

export const logout = async (_req: FastifyRequest, res: FastifyReply) => {
    try {
        await User.update(
            {
                access_token: '',
                refresh_token: '',
            },
            {
                where: {
                    id: _req['user'].id
                }
            }
        )

        res.code(200)
        return res.send(JSON.stringify({}, null, 2))
    } catch (e) {
        console.log('[logout]', e)
        return res.internalServerError('Internal server error');
    }
}
