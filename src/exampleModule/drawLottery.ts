export function drawLottery() {
    const rand = Math.random()
    if (rand > 0.99) {
        return true
    } else {
        return false
    }
}
