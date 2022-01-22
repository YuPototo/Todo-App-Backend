import User, { IUser } from '@/models/user'
import { getErrorMessage, stringifyUnknown } from '@/utils/err/errUtils'
import { MongoError } from 'mongodb'

import logger from '@/utils/logger'
import jwt from 'jsonwebtoken'

import config from '@/config'

import type { ServiceFailure } from './types'

export enum UserServiceError {
    DUPLICATE_USER_NAME = 'duplicate_username',
    INPUT_VALIDATION_ERROR = 'request_body_error',
    WRONG_PASSWORD = 'password_not_match',
    NO_USER = 'no_user',
    JWT_VERIFY_ERROR = 'jwt_verify_error',
    JWT_PAYLOAD_ERROR = 'jwt_payload_error',
    UNKOWN_MONGO_ERROR = 'unkown_mongo_error',
    UNKOWN_ERROR = 'unkown_error',
    NON_ERROR_TYPE = 'not_error_type',
}
// createUser

const validateCreateUserInput = (userName: string, password: string) => {
    if (password.length < 8) {
        const error: ServiceFailure = {
            name: UserServiceError.INPUT_VALIDATION_ERROR,
            message: '密码长度需要大于8',
        }
        throw error
    }

    if (userName.length < 4) {
        const error: ServiceFailure = {
            name: UserServiceError.INPUT_VALIDATION_ERROR,
            message: '用户名长度需要大于4',
        }
        throw error
    }
}

const handleCreateUserError = (err: unknown): ServiceFailure => {
    const isError = err instanceof Error

    if (isError) {
        const isMongoError = err instanceof MongoError

        if (isMongoError) {
            if (err.code === 11000) {
                return {
                    name: UserServiceError.DUPLICATE_USER_NAME,
                    message: '该用户名已被注册',
                }
            } else {
                logger.error(err.message)
                return {
                    name: UserServiceError.UNKOWN_MONGO_ERROR,
                    message: err.message,
                }
            }
        } else {
            logger.error(err.message)
            return {
                name: UserServiceError.UNKOWN_ERROR,
                message: err.message,
            }
        }
    } else {
        const message = stringifyUnknown(err)
        logger.error(message)
        return { name: UserServiceError.NON_ERROR_TYPE, message }
    }
}
interface CreateUserResData {
    userName: string
    userId: string
}

const createUser = async (
    userName: string,
    password: string
): Promise<CreateUserResData> => {
    validateCreateUserInput(userName, password)

    try {
        const user = new User({ userName, password })
        await user.save()
        return {
            userName: user.userName,
            userId: user._id.toString(),
        }
    } catch (err) {
        throw handleCreateUserError(err)
    }
}

// createAuthToken
const createAuthToken = (userId: string): string => {
    const payload = { userId } // 必须使用 object，否则不能设置 expiresIn
    const expiresIn = config.tokenExpireDays
    const token = jwt.sign(payload, config.appSecret, {
        expiresIn,
    })
    return token
}

// login
export type LoginResData = CreateUserResData

export const login = async (
    userName: string,
    password: string
): Promise<LoginResData> => {
    let user: IUser | null
    try {
        user = await User.findOne({ userName })
    } catch (err) {
        const message = getErrorMessage(err)
        logger.error(message)
        throw {
            name: UserServiceError.UNKOWN_MONGO_ERROR,
            message,
        }
    }

    if (!user) {
        const error = {
            name: UserServiceError.NO_USER,
            message: `找不到用户 ${userName}`,
        }
        throw error
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
        const error = {
            name: UserServiceError.WRONG_PASSWORD,
            message: '密码错误',
        }
        throw error
    }

    return { userName: user.userName, userId: user._id.toJSON() }
}

// getUserByToken
export const getUserByToken = async (token: string): Promise<IUser> => {
    const secret = config.appSecret

    const userId = getUserIdFromToken(token, secret)

    let user: IUser | null
    try {
        user = await User.findById(userId)
    } catch (err) {
        const message = getErrorMessage(err)
        logger.error(message)
        throw {
            name: UserServiceError.UNKOWN_MONGO_ERROR,
            message,
        }
    }

    if (!user) {
        throw {
            name: UserServiceError.NO_USER,
            message: '找不到用户',
        }
    }

    return user
}

// tryGetUserIdFromToken
const getUserIdFromToken = (token: string, secret: string) => {
    const decoded = decodeToken(token, secret)

    if (typeof decoded === 'string') {
        throw {
            name: UserServiceError.JWT_PAYLOAD_ERROR,
            message: 'decoded 不应该是 string',
        }
    }

    let userId: string
    try {
        userId = getUserIdFromPayload(decoded)
    } catch (err) {
        throw {
            name: UserServiceError.JWT_PAYLOAD_ERROR,
            message: getErrorMessage(err),
        }
    }
    return userId
}

// decodeToken
export const decodeToken = (
    token: string,
    secret: string
): jwt.JwtPayload | string => {
    try {
        return jwt.verify(token, secret)
    } catch (err) {
        const isError = err instanceof Error

        if (isError) {
            if (err instanceof jwt.TokenExpiredError) {
                const error = {
                    name: 'TokenExpiredError',
                    message: err.message,
                }
                throw error
            }

            if (err instanceof jwt.JsonWebTokenError) {
                const error = {
                    name: 'JsonWebTokenError',
                    message: err.message,
                }
                throw error
            }

            const error = { name: 'UnknownError', message: err.message }
            throw error
        } else {
            const message = stringifyUnknown(err)
            logger.error(message)
            const error = { name: 'nonErrorCatch', message: message }
            throw error
        }
    }
}

const getUserIdFromPayload = (payload: jwt.JwtPayload) => {
    if ('userId' in payload) {
        if (typeof payload['userId'] === 'string') {
            return payload['userId']
        } else {
            throw Error('userId 不是 string')
        }
    } else {
        throw Error('jwt payload 里没有 userId')
    }
}

export default {
    createUser,
    createAuthToken,
    getUserByToken,
    login,
}
