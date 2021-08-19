/**
 * 保留小数点(舍值)
 * @param val 数值
 * @param place 位数
 * @returns 结果
 */
export function KeepDecimal(val: number, place: number): number {
    // 不保留小数
    if (place == 0) {
        return Math.floor(val)
    }

    // 比例
    let rate = Math.pow(10, place)

    return Math.floor(val * rate) / rate
}