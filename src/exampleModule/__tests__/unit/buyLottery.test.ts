import { buyLottery } from '@/exampleModule/buyLottery'
import * as drawLotteryModule from '@/exampleModule/drawLottery'

describe('buyLottery', () => {
    const COST = 1
    const REWARD = 200

    it('win', () => {
        jest.spyOn(drawLotteryModule, 'drawLottery').mockReturnValue(true)
        expect(buyLottery(COST, REWARD)).toBe(REWARD - COST)
    })

    it('lose', () => {
        jest.spyOn(drawLotteryModule, 'drawLottery').mockReturnValue(false)
        expect(buyLottery(COST, REWARD)).toBe(-COST)
    })
})
