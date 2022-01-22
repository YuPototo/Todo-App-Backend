import dotenvExtended from 'dotenv-extended'
import dotenvParseVariables from 'dotenv-parse-variables'

import type { LogLevel } from '@/utils/logger'

const env = dotenvExtended.load({
    path: process.env.ENV_FILE,
    defaults: './config/.env.defaults',
    schema: './config/.env.schema',
    includeProcessEnv: true,
    silent: false,
    errorOnMissing: true,
    errorOnExtra: true,
})

const parsedEnv = dotenvParseVariables(env)

interface Config {
    port: number

    logger: {
        morgan: boolean
        morganBody: boolean
        loggerLevel: LogLevel
    }
}

const config: Config = {
    port: parsedEnv.PORT as number,

    logger: {
        morgan: parsedEnv.MORGAN_LOGGER as boolean,
        morganBody: parsedEnv.MORGAN_BODY_LOGGER as boolean,
        loggerLevel: parsedEnv.LOGGER_LEVEL as LogLevel,
    },
}

export default config
