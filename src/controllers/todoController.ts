import { RequestHandler, Request } from 'express'
import _ from 'lodash'

import todoService, {
    ServiceError,
    TodoServiceErrorEnum,
    UpdatableTodoPart,
} from '@/services/todoService'
import logger from '@/utils/logger'
import { isReturnableControllerError, ReturnableControllerObj } from './utils'
import { isServiceFailure } from '@/services/utils'

// * create todo controller
export const createTodoHandler: RequestHandler = async (req, res, next) => {
    const { content } = req.body

    if (!content) {
        const message = 'body should contain content'
        return res.status(400).json({ message })
    }

    try {
        const todo = await todoService.createTodo(
            req.user._id.toString(),
            content
        )
        return res.status(201).json({ todo })
    } catch (err) {
        if (isServiceFailure(err)) {
            const { statusCode, message } = handleCreateTodoError(err)
            return res.status(statusCode).json({ message })
        }
        next(err)
    }
}

const handleCreateTodoError = (
    error?: ServiceError
): ReturnableControllerObj => {
    if (error) {
        const message = error.message
        logger.error(message)
        return { statusCode: 500, message }
    } else {
        const message = 'createTodo return no proper error'
        logger.error(message)
        return { statusCode: 500, message }
    }
}

// * get one todo controller
export const getOneTodoHandler: RequestHandler = async (req, res, next) => {
    const { id: todoId } = req.params

    try {
        const todo = await todoService.getTodo(req.user, todoId)
        return res.json({ todo })
    } catch (err) {
        if (isServiceFailure(err)) {
            const { statusCode, message } = handleGetTodoError(err)
            return res.status(statusCode).json({ message })
        }
        next(err)
    }
}

const handleGetTodoError = (error: ServiceError): ReturnableControllerObj => {
    const { name: errorName } = error

    if (errorName === TodoServiceErrorEnum.WRONG_OWNER) {
        const message = `/unauthorized/: ${error.message}`
        return {
            statusCode: 401,
            message,
        }
    }

    if (errorName === TodoServiceErrorEnum.RESOURCE_NOT_FOUND) {
        const message = 'Resource not found'
        return {
            statusCode: 404,
            message,
        }
    }

    // uncategorized error
    const message = error.message
    logger.error(message)
    return { statusCode: 500, message }
}

// * get many todos controller
export const getTodosHandler: RequestHandler = async (req, res, next) => {
    try {
        const todos = await todoService.getUserTodos(req.user)
        return res.json({ todos })
    } catch (err) {
        next(err)
    }
}

// * delete controller
export const deleteTodoHandler: RequestHandler = async (req, res, next) => {
    const { id: todoId } = req.params

    try {
        await todoService.deleteTodo(req.user, todoId)
        return res.json()
    } catch (err) {
        if (isServiceFailure(err)) {
            const { statusCode, message } = handleDeleteTodoError(err)
            return res.status(statusCode).json({ message })
        }
        next(err)
    }
}

const handleDeleteTodoError = (
    error: ServiceError
): ReturnableControllerObj => {
    const { name: errorName } = error

    if (errorName === TodoServiceErrorEnum.WRONG_OWNER) {
        const message = `unauthorized: ${error.message}`
        return {
            statusCode: 401,
            message,
        }
    }

    if (errorName === TodoServiceErrorEnum.RESOURCE_NOT_FOUND) {
        const message = 'Resource not found'
        return {
            statusCode: 404,
            message,
        }
    }

    // uncategorized error
    const message = error.message
    logger.error(message)
    return { statusCode: 500, message }
}

// * update controller
interface UpdateReqBody {
    content: unknown
    isDone: unknown
    [key: string]: unknown
}

type ValidUpdateTodoInput = UpdatableTodoPart

const validateUpdateTodoInput = (req: Request): ValidUpdateTodoInput => {
    const { content, isDone, ...rest } = req.body as UpdateReqBody

    if (content === undefined && isDone === undefined) {
        const message = 'request body requires content or isDone'
        throw { statusCode: 400, message }
    }

    if (_.isEmpty(rest) === false) {
        const keyArray = _.keys(rest)
        const keyString = keyArray.join(', ')
        const message = `invalid body field: ${keyString}`
        throw { statusCode: 400, message }
    }

    return { content, isDone } as ValidUpdateTodoInput // 把格式校验交给 model
}

export const updateTodoHandler: RequestHandler = async (req, res, next) => {
    let validInput: ValidUpdateTodoInput
    try {
        validInput = validateUpdateTodoInput(req)
    } catch (err) {
        if (isReturnableControllerError(err)) {
            const { statusCode, message } = err
            return res.status(statusCode).json({ message })
        } else {
            next(err)
            return
        }
    }

    const { id: todoId } = req.params
    try {
        const todo = await todoService.updateTodo(req.user, todoId, validInput)
        return res.json({ todo })
    } catch (err) {
        if (isServiceFailure(err)) {
            const { statusCode, message } = handleUpdateTodoError(err)
            return res.status(statusCode).json({ message })
        }
        next(err)
    }
}

const handleUpdateTodoError = (
    error: ServiceError
): ReturnableControllerObj => {
    const { name: errorName } = error

    if (errorName === TodoServiceErrorEnum.WRONG_OWNER) {
        const message = `/unauthorized/: ${error.message}`
        return {
            statusCode: 401,
            message,
        }
    }

    if (errorName === TodoServiceErrorEnum.RESOURCE_NOT_FOUND) {
        const message = 'Resource not found'
        return {
            statusCode: 404,
            message,
        }
    }

    // uncategorized error
    const message = error.message
    logger.error(message)
    return { statusCode: 500, message }
}
