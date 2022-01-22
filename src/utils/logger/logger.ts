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

const prettyJson = winston.format.printf((info) => {
    if (info.message.constructor === Object) {
        info.message = JSON.stringify(info.message, null, 4)
    }
    return `${info.timestamp} ${info.label || '-'} ${info.level}: ${
        info.message
    }`
})

const format = winston.format.combine(
    winston.format.colorize(),
    winston.format.prettyPrint(),
    winston.format.splat(),
    winston.format.simple(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    prettyJson
)

const level =
    config.logger.loggerLevel === 'silent'
        ? undefined
        : config.logger.loggerLevel

const transports = [new winston.transports.Console({})] // 在这里设置输出形式

export const logger = winston.createLogger({
    level,
    silent: config.logger.loggerLevel === 'silent',
    format,
    defaultMeta: { service: 'express_mongo' },
    transports,
})
