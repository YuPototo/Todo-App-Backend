import request from 'supertest'
import { Express } from 'express-serve-static-core'
import faker from '@faker-js/faker'

import { createApp } from '@/app'
import db from '@/utils/db'
import User from '@/models/user'
import validator from 'validator'

let app: Express

beforeAll(async () => {
    await db.open()
    app = await createApp()
})

afterAll(async () => {
    await User.deleteMany()
    await db.close()
})

describe('POST /users', () => {
    afterEach(async () => {
        await User.deleteMany()
    })

    // input validation
    it('should respond 400 when password or name is not provided', async () => {
        const res = await request(app).post('/api/users')
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('缺少 password 或 name')
    })

    // business logic
    it('should respond 409 when duplicate user name is used', async () => {
        const userName = faker.internet.userName()
        const password = faker.internet.password()

        await request(app).post('/api/users').send({ userName, password })
        const res = await request(app)
            .post('/api/users')
            .send({ userName, password })
        expect(res.statusCode).toBe(409)
        expect(res.body.message).toBe('该用户名已被注册')
    })

    it('should respond 400 when password is too short', async () => {
        const userName = faker.internet.userName()
        const password = faker.internet.password(7)

        const res = await request(app)
            .post('/api/users')
            .send({ userName, password })
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('密码长度需要大于8')
    })

    it('should respond 400 when username is too short', async () => {
        const userName = 'abc'
        const password = faker.internet.password()

        const res = await request(app)
            .post('/api/users')
            .send({ userName, password })
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('用户名长度需要大于4')
    })

    it('should respond 201 with name and token', async () => {
        const userName = faker.internet.userName()
        const password = faker.internet.password()

        const res = await request(app)
            .post('/api/users')
            .send({ userName, password })
        expect(res.statusCode).toBe(201)
        expect(res.body.userName).toBe(userName)

        const token = res.body.token
        expect(validator.isJWT(token)).toBeTruthy()
    })
})

describe('POST /users/login', () => {
    afterEach(async () => {
        await User.deleteMany()
    })

    // input validation
    it('should respond 400 when required body fields are missed', async () => {
        const res1 = await request(app).post('/api/users/login')

        expect(res1.statusCode).toBe(400)
        expect(res1.body.message).toBe('缺少 password 或 name')

        const res2 = await request(app)
            .post('/api/users/login')
            .send({ userName: faker.internet.userName() })

        expect(res2.statusCode).toBe(400)
        expect(res2.body.message).toBe('缺少 password 或 name')

        const res3 = await request(app)
            .post('/api/users/login')
            .send({ password: faker.internet.password() })

        expect(res3.statusCode).toBe(400)
        expect(res3.body.message).toBe('缺少 password 或 name')
    })

    // business logic
    it('should respond with 401 when password not match name', async () => {
        const userName = faker.internet.userName()
        const password = faker.internet.password()

        await request(app).post('/api/users').send({ userName, password })

        const wrongPassword = password + 'abc'
        const res = await request(app)
            .post('/api/users/login')
            .send({ userName, password: wrongPassword })
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toBe('密码错误')
    })

    it('should respond with 401 when username not found', async () => {
        const userName = faker.internet.userName()
        const password = faker.internet.password()

        await request(app).post('/api/users').send({ userName, password })

        const wrongName = userName + 'abc'
        const res = await request(app)
            .post('/api/users/login')
            .send({ userName: wrongName, password })

        expect(res.statusCode).toBe(401)
        expect(res.body.message).toMatch(/找不到用户/)
    })

    // success
    it('should respond 200 with username and token', async () => {
        const userName = faker.internet.userName()
        const password = faker.internet.password()

        await request(app).post('/api/users').send({ userName, password })

        const res = await request(app)
            .post('/api/users/login')
            .send({ userName, password })
        expect(res.statusCode).toBe(200)
        expect(res.body.userName).toBe(userName)

        const token = res.body.token
        expect(validator.isJWT(token)).toBeTruthy()
    })
})
