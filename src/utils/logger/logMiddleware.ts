import morgan from 'morgan'
import morganBody from 'morgan-body'

import config from '@/config'
// import logger from "./index";

import type { Express } from 'express-serve-static-core'

const LOGGER_FORMAT =
    ':method :url :status :response-time ms - :res[content-length]'

function useMorgan(app: Express) {
    app.use(
        morgan(LOGGER_FORMAT, {
            // specify a function for skipping requests without errors
            // skip: (req, res) => res.statusCode < 400,
            // specify a stream for requests logging
            // stream: {
            //     write: (msg) => logger.http(msg),
            // },
        })
    )
}

export function useLog(app: Express) {
    if (config.logger.morgan) useMorgan(app)

    if (config.logger.morganBody) {
        morganBody(app)
    }
}
