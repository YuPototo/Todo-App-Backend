import request from 'supertest'
import { Express } from 'express-serve-static-core'
import faker from '@faker-js/faker'
import { ObjectID } from 'bson'

import { createApp } from '@/app'
import db from '@/utils/db'
import User from '@/models/user'
import Todo from '@/models/todo'
import { createToken } from '@/tests/testUtils/createToken'
import { createUser } from '@/tests/testUtils/createUser'

import config from '@/config'

let app: Express

const USER_ONE_ID = '615d6736c6624f741627d64f'
const USER_TWO_ID = '61ea914a5f85b5625191e840'

let userTokenOne: string
let userTokenTwo: string

beforeAll(async () => {
    await db.open()
    app = await createApp()
    await createUser(USER_ONE_ID)
    await createUser(USER_TWO_ID)
    userTokenOne = createToken(USER_ONE_ID, config.appSecret)
    userTokenTwo = createToken(USER_TWO_ID, config.appSecret)
})

afterAll(async () => {
    await Todo.deleteMany()
    await User.deleteMany()
    await db.close()
})

describe('POST /todos', () => {
    afterAll(async () => {
        await Todo.deleteMany()
    })

    it('should require auth', async () => {
        const res = await request(app).post('/api/todos')
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toMatch(/unauthorized/)
    })

    it('should check request body', async () => {
        const res = await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${userTokenOne}`)
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('body should contain content')
    })

    it('should create todo', async () => {
        const content = faker.word.noun()
        const res = await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${userTokenOne}`)
            .send({ content })

        expect(res.statusCode).toBe(201)
        expect(res.body.todo).toEqual({
            id: expect.any(String),
            content,
            isDone: false,
            createdAt: expect.any(Number),
            updatedAt: expect.any(Number),
        })
    })
})

describe('GET /todos/:id', () => {
    const USER_1_TODO = 'study japanese'

    let userOneTodoId: string

    beforeAll(async () => {
        // user 1 创建了一个 todo
        const res1 = await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${userTokenOne}`)
            .send({ content: USER_1_TODO })
        userOneTodoId = res1.body.todo.id
    })

    afterAll(async () => {
        await Todo.deleteMany()
    })

    it('should require auth', async () => {
        const res = await request(app).get('/api/todos/123')
        expect(res.statusCode).toBe(401)
    })

    it("should return 401 when getting other's item", async () => {
        const res = await request(app)
            .get(`/api/todos/${userOneTodoId}`)
            .set('Authorization', `Bearer ${userTokenTwo}`)
        expect(res.statusCode).toBe(401)
    })

    it('should return 404 when resource not found', async () => {
        const randomId = new ObjectID()
        const res = await request(app)
            .get(`/api/todos/${randomId}`)
            .set('Authorization', `Bearer ${userTokenOne}`)
        expect(res.statusCode).toBe(404)
    })

    it('should return 200 when found', async () => {
        const res = await request(app)
            .get(`/api/todos/${userOneTodoId}`)
            .set('Authorization', `Bearer ${userTokenOne}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.todo).toEqual({
            id: userOneTodoId,
            content: USER_1_TODO,
            isDone: expect.any(Boolean),
            createdAt: expect.any(Number),
            updatedAt: expect.any(Number),
        })
    })
})

describe('GET /todos', () => {
    afterEach(async () => {
        await Todo.deleteMany()
    })

    it('require auth', async () => {
        const res = await request(app).get('/api/todos')
        expect(res.statusCode).toBe(401)
    })

    it('return todos when item found', async () => {
        const contentOne = 'Learn TS'
        const contentTwo = 'Do Sports'

        await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${userTokenOne}`)
            .send({ content: contentOne })

        await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${userTokenOne}`)
            .send({ content: contentTwo })

        const res = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${userTokenOne}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('todos')
        expect(res.body.todos).toHaveLength(2)
    })

    it('return 200 when no items found', async () => {
        const res = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${userTokenTwo}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.todos).toEqual([])
    })
})

describe('DELETE /todos/:id', () => {
    const USER_1_TODO = 'study japanese'

    let userOneTodoId: string

    beforeEach(async () => {
        // user 1 创建了一个 todo
        const res1 = await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${userTokenOne}`)
            .send({ content: USER_1_TODO })
        userOneTodoId = res1.body.todo.id
    })

    afterEach(async () => {
        await Todo.deleteMany()
    })

    it('should require auth', async () => {
        const res = await request(app).delete('/api/todos/123')
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toMatch(/unauthorized/)
    })

    it("should return 401 when user whats to delete other's item", async () => {
        const res = await request(app)
            .delete(`/api/todos/${userOneTodoId}`)
            .set('Authorization', `Bearer ${userTokenTwo}`)
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toMatch(/unauthorized/)
    })

    it('should return 404 when item is not found', async () => {
        const randomId = new ObjectID()
        const res = await request(app)
            .delete(`/api/todos/${randomId.toString()}`)
            .set('Authorization', `Bearer ${userTokenOne}`)
        expect(res.statusCode).toBe(404)
        expect(res.body.message).toMatch('Resource not found')
    })

    it('should delete item', async () => {
        const res = await request(app)
            .delete(`/api/todos/${userOneTodoId}`)
            .set('Authorization', `Bearer ${userTokenOne}`)
        expect(res.statusCode).toBe(200)

        const todoAfter = await Todo.findById(userOneTodoId)
        expect(todoAfter).toBeNull()
    })
})

describe('PATCH /todos/:id', () => {
    const USER_1_TODO = 'study japanese'

    let userOneTodoId: string

    beforeEach(async () => {
        // user 1 创建了一个 todo
        const res1 = await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${userTokenOne}`)
            .send({ content: USER_1_TODO })
        userOneTodoId = res1.body.todo.id
    })

    afterEach(async () => {
        await Todo.deleteMany()
    })

    it('require auth', async () => {
        const res = await request(app).patch('/api/todos/1')
        expect(res.statusCode).toBe(401)
    })

    it('return 400 when req body contains no content and isDone', async () => {
        const res = await request(app)
            .patch('/api/todos/1')
            .set('Authorization', `Bearer ${userTokenOne}`)
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('request body requires content or isDone')

        const res2 = await request(app)
            .patch('/api/todos/1')
            .set('Authorization', `Bearer ${userTokenOne}`)
            .send({ isDone: true })
        expect(res2.body.message).not.toBe(
            'request body requires content or isDone'
        )
    })

    it('return 400 when req body contains fields other than content and isDone', async () => {
        const res = await request(app)
            .patch('/api/todos/1')
            .set('Authorization', `Bearer ${userTokenOne}`)
            .send({ isDone: true, createdAt: 1 })
        expect(res.statusCode).toBe(400)
        expect(res.body.message).toBe('invalid body field: createdAt')
    })

    it("return 401 when user wants to change other's item", async () => {
        const res = await request(app)
            .patch(`/api/todos/${userOneTodoId}`)
            .set('Authorization', `Bearer ${userTokenTwo}`)
            .send({ isDone: true })
        expect(res.statusCode).toBe(401)
    })

    it('return 404 when resource not found', async () => {
        const someRandomId = new ObjectID()
        const res = await request(app)
            .patch(`/api/todos/${someRandomId.toString()}`)
            .set('Authorization', `Bearer ${userTokenOne}`)
            .send({ isDone: true })

        expect(res.statusCode).toBe(404)
    })

    it('return 200 when success', async () => {
        const res1 = await request(app)
            .patch(`/api/todos/${userOneTodoId}`)
            .set('Authorization', `Bearer ${userTokenOne}`)
            .send({ isDone: true })
        expect(res1.statusCode).toBe(200)
        expect(res1.body).toHaveProperty('todo')
        expect(res1.body.todo).toMatchObject({
            isDone: true,
            content: USER_1_TODO,
        })

        const UPDATED_CONTENT = 'Master TS'
        const res2 = await request(app)
            .patch(`/api/todos/${userOneTodoId}`)
            .set('Authorization', `Bearer ${userTokenOne}`)
            .send({ content: UPDATED_CONTENT })
        expect(res2.statusCode).toBe(200)
        expect(res2.body).toHaveProperty('todo')
        expect(res2.body.todo).toMatchObject({
            isDone: true,
            content: UPDATED_CONTENT,
        })
    })
})
