/* istanbul ignore file */
import winston from 'winston'
import config from '@/config'

export type LogLevel =
    | 'silent'
    | 'error'
    | 'warn'
    | 'info'
    | 'http'
    | 'verbose'
    | 'debug'
    | 'silly'

// npm debug levels (winston default):
// {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3
//   verbose: 4,
//   debug: 5,
//   silly: 6
// }

const prettyJson = (indent?: number) =>
    winston.format.printf((info) => {
        if (info.message.constructor === Object) {
            info.message = JSON.stringify(info.message, null, indent)
        }
        return `${info.timestamp} ${info.label || '-'} ${info.level}: ${
            info.message
        }`
    })

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.prettyPrint(),
    winston.format.splat(),
    winston.format.simple(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    prettyJson(4)
)

const fileFormat = winston.format.combine(
    winston.format.prettyPrint(),
    winston.format.splat(),
    winston.format.simple(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    prettyJson()
)

const transports = [
    new winston.transports.File({
        filename: config.logger.errorLog,
        level: 'error',
        format: fileFormat,
    }),
    new winston.transports.Console({ format: consoleFormat }),
]

const level =
    config.logger.loggerLevel === 'silent'
        ? undefined
        : config.logger.loggerLevel

export const logger = winston.createLogger({
    level,
    silent: config.logger.loggerLevel === 'silent',
    defaultMeta: { service: 'express_mongo' },
    transports,
})
