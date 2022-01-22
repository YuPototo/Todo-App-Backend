import request from 'supertest'
import { Express } from 'express-serve-static-core'

import { createApp } from '@/app'

let app: Express

beforeAll(async () => {
    app = await createApp()
})

it('should require auth', async () => {
    const res = await request(app).get('/')
    expect(res.text).toMatch(/Hello World/)
})
