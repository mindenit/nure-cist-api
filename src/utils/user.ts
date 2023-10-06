// Interfaces
import { IJwt } from '../interfaces/auth';

// Models
import { User } from '../db/models/User';

export const updateUser = async (id: number, data: IJwt): Promise<void> => {
    await User.update({
        access_token: data.access_token,
        refresh_token: data.refresh_token
    }, {
        where: {
            id
        }
    })
}

export const findUserByToken = async (tokenName: 'access_token' | 'refresh_token', token: string): Promise<User> => {
    return await User.findOne({
        where: {
            [tokenName]: token
        }
    })
}

export const findUserByEmail = async (email: string): Promise<User> => {
    return await User.findOne({
        where: {
            email,
        }
    })
}


