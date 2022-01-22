import { Schema, Document, model, Model, Types } from 'mongoose'
import User from './user'

const COLLECTION_NAME = 'todo'

export interface ITodo extends Document {
    content: string
    isDone: boolean
    createdAt: Date
    updatedAt: Date
    user: Types.ObjectId
}

const todoSchema = new Schema<ITodo>(
    {
        content: { type: String, required: true },
        isDone: { type: Boolean, default: false },
        user: { type: Schema.Types.ObjectId, ref: User, required: true },
    },
    { timestamps: true, collection: COLLECTION_NAME }
)

// toJSON method
todoSchema.set('toJSON', {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (doc, ret, options) {
        ret.createdAt = ret.createdAt.getTime()
        ret.updatedAt = ret.updatedAt.getTime()
        ret.id = ret._id.toString()

        delete ret.user
        delete ret.__v
        delete ret._id
    },
})

export type TodoModel = Model<ITodo>

export const Todo = model<ITodo, TodoModel>('Todo', todoSchema)

export default Todo
