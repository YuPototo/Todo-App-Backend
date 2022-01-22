import { Schema, Document, model, Model } from 'mongoose'
import bcrypt from 'bcrypt'

const COLLECTION_NAME = 'user'

export interface IUser extends Document {
    createdAt: Date
    userName: string
    password: string

    comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
    {
        userName: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { collection: COLLECTION_NAME }
)

// save hook
userSchema.pre('save', async function (next): Promise<void> {
    if (!this.isModified('password')) {
        next()
        return
    }

    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    next()
})

// toJSON method
userSchema.set('toJSON', {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (doc, ret, options) {
        ret.createdAt = ret.createdAt.getTime()

        delete ret.__v
        delete ret._id
        delete ret.password
    },
})

// comparePassword methods
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    const { password } = this
    return await bcrypt.compare(candidatePassword, password)
}

export type UserModel = Model<IUser>

export const User = model<IUser, UserModel>('User', userSchema)

export default User
