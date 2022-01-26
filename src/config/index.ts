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

    appSecret: string
    tokenExpireDays: string

    logger: {
        morgan: boolean
        morganBody: boolean
        loggerLevel: LogLevel
        errorLog: string
    }

    mongo: {
        url: string
        autoIndex: boolean
    }
}

const config: Config = {
    port: parsedEnv.PORT as number,

    appSecret: parsedEnv.APP_SECRET as string,
    tokenExpireDays: parsedEnv.TOKEN_EXPIRE_DAYS as string,

    logger: {
        morgan: parsedEnv.MORGAN_LOGGER as boolean,
        morganBody: parsedEnv.MORGAN_BODY_LOGGER as boolean,
        loggerLevel: parsedEnv.LOGGER_LEVEL as LogLevel,
        errorLog: parsedEnv.ERROR_LOG as string,
    },

    mongo: {
        url: parsedEnv.MONGO_URL as string,
        autoIndex: parsedEnv.MONGO_AUTO_INDEX as boolean,
    },
}

export default config
