import { drawLottery } from './drawLottery'

export function buyLottery(cost: number, reward: number) {
    const isLucky = drawLottery()

    if (isLucky) {
        return reward - cost
    } else {
        return -cost
    }
}
