import { ObjectId } from 'mongodb'

import Todo from '@/models/todo'
import db from '@/utils/db'

const USER_OID = new ObjectId('6162f563355a44f79160ed25')

beforeAll(async () => {
    await db.open()
})

afterAll(async () => {
    await Todo.deleteMany()
    await db.close()
})

describe('create a todo', () => {
    it('should create a todo item', async () => {
        const content = 'this is todo item'
        const todo = new Todo({ content, user: USER_OID })

        const before = Date.now()
        await todo.save()

        const fetched = await Todo.findById(todo._id)

        const after = Date.now()

        expect(fetched).not.toBeNull()
        expect(fetched!.content).toBe(content)
        expect(fetched!.isDone).toBeFalsy()
        expect(fetched!.user._id.toString()).toBe(USER_OID.toString())
        expect(fetched!.createdAt.getTime()).toBeGreaterThanOrEqual(before)
        expect(fetched!.createdAt.getTime()).toBeLessThanOrEqual(after)
    })
})

describe('toJSON', () => {
    it('should return valid JSON', async () => {
        const content = 'this is todo item'
        const todo = new Todo({ content, user: USER_OID })

        await todo.save()

        expect(todo.toJSON()).toEqual({
            content,
            isDone: false,
            id: expect.any(String),
            createdAt: expect.any(Number),
            updatedAt: expect.any(Number),
        })
    })
})
