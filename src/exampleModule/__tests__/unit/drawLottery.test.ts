import { drawLottery } from '@/exampleModule/drawLottery'

describe('drawLottery()', () => {
    afterAll(() => {
        jest.spyOn(global.Math, 'random').mockRestore()
    })

    it('return true when win', () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.999)
        expect(drawLottery()).toBeTruthy()
    })

    it('return false when lost', () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.1)
        expect(drawLottery()).toBeFalsy()
    })
})
