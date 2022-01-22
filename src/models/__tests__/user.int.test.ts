import faker from '@faker-js/faker'

import User from '@/models/user'
import db from '@/utils/db'

beforeAll(async () => {
    await db.open()
})

afterAll(async () => {
    await User.deleteMany()
    await db.close()
})

describe('save', () => {
    it('should create user', async () => {
        const password = faker.internet.password()
        const userName = faker.internet.userName()
        const before = Date.now()

        const user = new User({ password: password, userName })
        await user.save()

        const after = Date.now()

        const fetched = await User.findById(user._id)
        expect(fetched).not.toBeNull()

        expect(fetched!.userName).toBe(userName)
        expect(fetched!.password).not.toBe(password)

        expect(before).toBeLessThanOrEqual(fetched!.createdAt.getTime())
        expect(fetched!.createdAt.getTime()).toBeLessThanOrEqual(after)
    })

    it('should update user', async () => {
        const username1 = faker.internet.userName()
        const user = new User({
            password: faker.internet.password(),
            userName: username1,
        })
        const dbUser1 = await user.save()

        const username2 = faker.internet.userName()
        dbUser1.userName = username2
        const dbUser2 = await dbUser1.save()
        expect(dbUser2.userName).toEqual(username2)
    })

    it('should not save user without a password', async () => {
        const user2 = new User({
            userName: faker.internet.userName(),
        })
        await expect(user2.save()).rejects.toThrowError(/password/)
    })

    it('should not save user without a name', async () => {
        const user1 = new User({
            password: faker.internet.password(),
        })
        await expect(user1.save()).rejects.toThrowError(/userName/)
    })

    it('should not save user with the same name', async () => {
        const password = faker.internet.password()
        const userName = faker.internet.userName()
        const userData = { password: password, userName }

        const user1 = new User(userData)
        await user1.save()

        const user2 = new User(userData)
        await expect(user2.save()).rejects.toThrowError(/E11000/)
    })

    it('should not save password in a readable form', async () => {
        const password = faker.internet.password()

        const user1 = new User({
            password: password,
            userName: faker.internet.userName(),
        })
        await user1.save()
        expect(user1.password).not.toBe(password)

        const user2 = new User({
            password: password,
            userName: faker.internet.userName(),
        })
        await user2.save()
        expect(user2.password).not.toBe(password)

        expect(user1.password).not.toBe(user2.password)
    })
})

describe('comparePassword', () => {
    it('should return true for valid password', async () => {
        const password = faker.internet.password()
        const user = new User({
            password: password,
            userName: faker.internet.userName(),
        })
        await user.save()
        expect(await user.comparePassword(password)).toBe(true)
    })

    it('should return false for invalid password', async () => {
        const user = new User({
            password: faker.internet.password(),
            userName: faker.internet.userName(),
        })
        await user.save()
        expect(await user.comparePassword(faker.internet.password())).toBe(
            false
        )
    })

    it('should update password hash if password is updated', async () => {
        const password1 = faker.internet.password()
        const user = new User({
            password: password1,
            userName: faker.internet.userName(),
        })
        const dbUser1 = await user.save()
        expect(await dbUser1.comparePassword(password1)).toBe(true)

        const password2 = faker.internet.password()
        dbUser1.password = password2
        const dbUser2 = await dbUser1.save()
        expect(await dbUser2.comparePassword(password2)).toBe(true)
        expect(await dbUser2.comparePassword(password1)).toBe(false)
    })
})

describe('toJSON', () => {
    it('should return valid JSON', async () => {
        const password = faker.internet.password()
        const userName = faker.internet.userName()

        const user = new User({ password: password, userName })
        await user.save()

        expect(user.toJSON()).toEqual({
            userName,
            createdAt: expect.any(Number),
        })
    })
})
