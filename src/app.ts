import express, { Request, Response, NextFunction } from 'express'
import type { Express } from 'express-serve-static-core'
import logger, { useLog } from '@/utils/logger'
import cors from 'cors'

import userRouter from './routes/userRoute'
import todoRouter from './routes/todoRoute'
import logRouter from './routes/logRoute'

import { getErrorMessage } from './utils/err/errUtils'

const API_PREFIX = '/api'

export async function createApp(): Promise<Express> {
    const app = express()

    app.use(express.json()) // 保证 http request body 会被作为 json 传入
    app.use(cors()) // 允许跨域访问

    useLog(app)

    // routes
    app.use(`${API_PREFIX}/users`, userRouter)
    app.use(`${API_PREFIX}/todos`, todoRouter)
    app.use(`${API_PREFIX}/logs`, logRouter)

    // Error-handling middleware: 必须使用 4个 argument
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        const errMessage = getErrorMessage(err)
        logger.error(errMessage)
        res.status(500).json({ message: errMessage })
    })
    return app
}
