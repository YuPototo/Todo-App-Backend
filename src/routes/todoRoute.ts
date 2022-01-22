import { Router } from 'express'

import {
    createTodoHandler,
    deleteTodoHandler,
    getOneTodoHandler,
    getTodosHandler,
    updateTodoHandler,
} from '@/controllers/todoController'
import { auth } from '@/middleware/auth'

const router = Router()

router.route('/').post(auth, createTodoHandler).get(auth, getTodosHandler)
router
    .route('/:id')
    .get(auth, getOneTodoHandler)
    .delete(auth, deleteTodoHandler)
    .patch(auth, updateTodoHandler)

export default router
