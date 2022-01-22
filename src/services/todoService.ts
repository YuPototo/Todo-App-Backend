import Todo, { ITodo } from '@/models/todo'
import { IUser } from '@/models/user'
import { getErrorMessage } from '@/utils/err/errUtils'
import logger from '@/utils/logger'
import { RequireAtLeastOne } from '@/utils/types/typesHelper'

export enum TodoServiceErrorEnum {
    WRONG_OWNER = 'user_not_own_resource',
    RESOURCE_NOT_FOUND = 'resource_not_found',
    UNKOWN_MONGO_ERROR = 'unkown_mongo_error',
    UNKOWN_ERROR = 'unkown_error',
    NON_ERROR_TYPE = 'not_error_type',
}

// utils

const checkUserOwnTodo = async (user: IUser, todo: ITodo) => {
    if (todo.user.toString() !== user._id.toString()) {
        // eslint-disable-next-line quotes
        const message = "You don't own this resource"
        const error = { name: TodoServiceErrorEnum.WRONG_OWNER, message }
        throw error
    }
}

const findTodoById = async (id: string): Promise<ITodo> => {
    let todo: ITodo | null
    try {
        todo = await Todo.findById(id)
    } catch (err) {
        const message = getErrorMessage(err)
        logger.error(message)
        throw {
            name: TodoServiceErrorEnum.UNKOWN_MONGO_ERROR,
            message,
        }
    }

    if (!todo) {
        const message = 'resource not found'
        throw {
            name: TodoServiceErrorEnum.RESOURCE_NOT_FOUND,
            message,
        }
    }
    return todo
}

// createToDo
const createTodo = async (userId: string, content: string): Promise<ITodo> => {
    try {
        const todo = new Todo({ content, user: userId })
        await todo.save()
        return todo
    } catch (err) {
        const message = getErrorMessage(err)
        logger.error(message)
        throw {
            name: TodoServiceErrorEnum.UNKOWN_MONGO_ERROR,
            message,
        }
    }
}

const deleteTodo = async (user: IUser, todoId: string): Promise<void> => {
    const todo = await findTodoById(todoId)

    await checkUserOwnTodo(user, todo)

    try {
        await todo.delete()
    } catch (err) {
        const message = getErrorMessage(err)
        logger.error(message)
        throw {
            name: TodoServiceErrorEnum.UNKOWN_MONGO_ERROR,
            message,
        }
    }
}

// getTodoById
const getTodo = async (user: IUser, todoId: string): Promise<ITodo> => {
    const todo = await findTodoById(todoId)

    await checkUserOwnTodo(user, todo)

    return todo
}

// get user todos
const getUserTodos = async (user: IUser): Promise<ITodo[]> => {
    try {
        const todos = await Todo.find({ user: user._id })
        return todos
    } catch (err) {
        const message = getErrorMessage(err)
        logger.error(message)
        throw {
            name: TodoServiceErrorEnum.UNKOWN_MONGO_ERROR,
            message,
        }
    }
}

// update Todo
export type UpdatableTodoPart = RequireAtLeastOne<{
    content: string
    isDone: boolean
}>

const updateTodo = async (
    user: IUser,
    todoId: string,
    updatedPart: UpdatableTodoPart
): Promise<ITodo> => {
    const todo = await findTodoById(todoId)
    await checkUserOwnTodo(user, todo)

    const { content, isDone } = updatedPart
    if (content !== undefined) {
        todo.content = content
    }
    if (isDone !== undefined) {
        todo.isDone = isDone
    }

    let newTodo: ITodo
    try {
        newTodo = await todo.save()
    } catch (err) {
        const message = getErrorMessage(err)
        logger.error(message)
        throw {
            name: TodoServiceErrorEnum.UNKOWN_MONGO_ERROR,
            message,
        }
    }

    return newTodo
}

export type { ServiceFailure as ServiceError } from './types'

export default { createTodo, getTodo, deleteTodo, getUserTodos, updateTodo }
