import User from '@/models/user'
import faker from '@faker-js/faker'

export const createUser = async (userId: string) => {
    await User.create({
        _id: userId,
        userName: faker.internet.userName(),
        password: faker.internet.password(),
    })
}
