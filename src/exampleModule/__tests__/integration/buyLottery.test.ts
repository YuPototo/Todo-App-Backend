import { buyLottery } from '@/exampleModule/buyLottery'

describe('buyLottery()', () => {
    afterAll(() => {
        jest.spyOn(global.Math, 'random').mockRestore()
    })

    const COST = 1
    const REWARD = 200

    it('win', () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.999)
        expect(buyLottery(COST, REWARD)).toBe(REWARD - COST)
    })

    it('lose', () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.1)
        expect(buyLottery(COST, REWARD)).toBe(-COST)
    })
})
