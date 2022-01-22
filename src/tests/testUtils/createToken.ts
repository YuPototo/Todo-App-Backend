import jwt from 'jsonwebtoken'

export const createToken = (userId: string, secret: string): string => {
    return jwt.sign({ userId }, secret)
}
