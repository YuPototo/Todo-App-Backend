import faker from '@faker-js/faker'
import validator from 'validator'
import jwt from 'jsonwebtoken'
import { Document } from 'mongoose'

import userService from '@/services/userService'

import User from '@/models/user'
import db from '@/utils/db'

import config from '@/config'

beforeAll(async () => {
    await db.open()
})

afterAll(async () => {
    await User.deleteMany()
    await db.close()
})

describe('createUser()', () => {
    it('should failure when names are used twice', async () => {
        const userName = faker.internet.userName()
        const password = faker.internet.password()

        await userService.createUser(userName, password)

        await expect(
            userService.createUser(userName, password)
        ).rejects.toEqual({
            name: 'duplicate_username',
            message: '该用户名已被注册',
        })
    })

    it('should fail when password too short', async () => {
        const userName = faker.internet.userName()
        const password = '1'

        await expect(
            userService.createUser(userName, password)
        ).rejects.toEqual({
            name: 'request_body_error',
            message: '密码长度需要大于8',
        })
    })

    it('should fail when username too short', async () => {
        const userName = 'abc'
        const password = faker.internet.password()

        await expect(
            userService.createUser(userName, password)
        ).rejects.toEqual({
            name: 'request_body_error',
            message: '用户名长度需要大于4',
        })
    })

    it('should return user name', async () => {
        const userName = faker.internet.userName()
        const password = faker.internet.password()

        const result = await userService.createUser(userName, password)

        //@ts-ignore
        expect(result.userName).toBe(userName)
        //@ts-ignore
        const userId = result.userId
        expect(validator.isMongoId(userId)).toBeTruthy()
    })
})

describe('createAuthToken()', () => {
    it('should generate a valid jwt token', async () => {
        const userId = 'some_id'
        const token = await userService.createAuthToken(userId)
        expect(validator.isJWT(token)).toBeTruthy()
    })

    it('should generate a verifiable token', async () => {
        const userId = 'some_id'
        const token = await userService.createAuthToken(userId)
        const decoded = jwt.verify(token, config.appSecret) as jwt.JwtPayload
        expect(decoded.userId).toBe(userId)
    })
})

describe('getUserByToken()', () => {
    it('should return failure when decoded is string', async () => {
        const token = jwt.sign('somestring', config.appSecret)
        await expect(userService.getUserByToken(token)).rejects.toEqual({
            name: 'jwt_payload_error',
            message: 'decoded 不应该是 string',
        })
    })

    it('should return failure when decoded payload has no userId', async () => {
        const payload = { id: 'something_strange' }
        const token = jwt.sign(payload, config.appSecret)
        await expect(userService.getUserByToken(token)).rejects.toEqual({
            name: 'jwt_payload_error',
            message: 'jwt payload 里没有 userId',
        })
    })

    it('should return failure when token expires ', async () => {
        const payload = { userId: 'some_id' }
        const token = jwt.sign(payload, config.appSecret, { expiresIn: '1ms' })
        await expect(userService.getUserByToken(token)).rejects.toEqual({
            name: 'TokenExpiredError',
            message: 'jwt expired',
        })
    })

    it('should return failure when token is invalid expires ', async () => {
        const BAD_SECRET = 'bad_bad'
        const payload = { userId: 'some_id' }
        const token = jwt.sign(payload, BAD_SECRET)
        await expect(userService.getUserByToken(token)).rejects.toEqual({
            name: 'JsonWebTokenError',
            message: 'invalid signature',
        })
    })

    it('should return failure when user not found', async () => {
        const userId = '6162f563355a44f79160ed25'
        const payload = { userId }
        const token = jwt.sign(payload, config.appSecret)
        await expect(userService.getUserByToken(token)).rejects.toEqual({
            name: 'no_user',
            message: '找不到用户',
        })
    })

    it('should return user when user found', async () => {
        const user = new User({
            userName: faker.internet.userName(),
            password: faker.internet.password(),
        })
        await user.save()

        const userId = user._id.toString()
        const payload = { userId }
        const token = jwt.sign(payload, config.appSecret)

        const fetchedUser = await userService.getUserByToken(token)
        expect(fetchedUser instanceof Document).toBeTruthy()
        expect(fetchedUser._id.toString()).toBe(userId)
        expect(fetchedUser.toJSON()).toEqual(user.toJSON())
    })
})
