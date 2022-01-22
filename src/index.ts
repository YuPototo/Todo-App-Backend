import { createApp } from './app'
import config from '@/config'

import { logger } from '@/utils/logger/logger'

createApp()
    .then((app) => {
        app.listen(config.port, () => {
            logger.info(`Listening on http://localhost:${config.port}`)
        })
    })
    .catch((err) => {
        logger.error(`Error: ${err}`)
    })
