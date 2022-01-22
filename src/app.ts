import express from 'express'
import type { Express } from 'express-serve-static-core'

export async function createApp(): Promise<Express> {
    const app = express()

    app.get('/', (req, res) => {
        res.send('Hello World')
    })

    return app
}
