// Core
import jwt from 'jsonwebtoken'

// Config
import { env } from '../config'

// Interfaces
import { IJwt, IJwtPayload } from '../interfaces/auth'

export const generateTokens = async ({ id }: IJwtPayload): Promise<IJwt> => {
    try {
        const access_token = jwt.sign({ id }, env.ACCESS_SECRET, { expiresIn: env.ACCESS_TIME })
        const refresh_token = jwt.sign({ id }, env.REFRESH_TIME, { expiresIn: env.REFRESH_TIME })

        return {
            access_token,
            refresh_token
        }
    } catch (e) {
        console.log('[generateTokens]', e)
    }
}
