import { createApp } from './app'
import db from '@/utils/db'
import logger from '@/utils/logger'

import config from '@/config'
import { getErrorMessage } from './utils/err/errUtils'

db.open()
    .then(() => createApp())
    .then((app) => {
        app.listen(config.port, () => {
            logger.info(`Listening on http://localhost:${config.port}`)
        })
    })
    .catch((err) => {
        logger.error(getErrorMessage(err))
    })
