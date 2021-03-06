/**
 * 获取升级至下一级所需的经验
 * @param level 当前等级
 * @returns 下一级所需的经验
 */
export function GetNextExp(level: number): number {
    return expList[level + 1]
}

/**
 * 更新等级
 * @param level 当前等级 
 * @param exp 经验总额
 * @returns 新等级
 * @returns 剩余经验值
 */
export function UpdateLevel(level: number, exp: number): { level: number, exp: number } {
    // 下一级所需经验
    let next = GetNextExp(level)

    while (exp >= next) {
        // 提升等级
        level++
        // 减少总经验
        exp -= next
        // 更新下一级所需经验
        next = GetNextExp(level)
        if (!next) {
            break
        }
    }

    return { level: level, exp: exp }
}

/**
 * 经验列表
 */
const expList = {
    // 2-10级
    2: 100, 3: 170, 4: 328, 5: 535, 6: 790, 7: 1094, 8: 1447, 9: 1848, 10: 2298,
    // 11-20级
    11: 3816, 12: 5054, 13: 6402, 14: 7974, 15: 9644, 16: 11628, 17: 13710, 18: 16597, 19: 19757, 20: 23080,
    // 21-30级
    21: 35487, 22: 41332, 23: 49357, 24: 58546, 25: 68984, 26: 81343, 27: 96033, 28: 113050, 29: 132574, 30: 155496,
    // 31-40级
    31: 194438, 32: 254776, 33: 317532, 34: 368684, 35: 414996, 36: 468892, 37: 535308, 38: 614733, 39: 700936, 40: 804667,
    // 41-50级
    41: 902038, 42: 1156464, 43: 1274862, 44: 1406056, 45: 1559195, 46: 1719120, 47: 1902432, 48: 2093259, 49: 2304897, 50: 2536984,
    // 51-60级
    51: 2784305, 52: 4388407, 53: 4877952, 54: 5425932, 55: 6046052, 56: 6751353, 57: 7813250, 58: 8629296, 59: 9691276, 60: 10916412,
    // 61-70级
    61: 12331760, 62: 15820713, 63: 16719832, 64: 17664576, 65: 18658043, 66: 19694713, 67: 21200960, 68: 22356034, 69: 23569026, 70: 24835906,
    // 71-80级
    71: 26164473, 72: 34768559, 73: 38020791, 74: 41257922, 75: 44656740, 76: 48230050, 77: 51984219, 78: 55918137, 79: 60053041, 80: 64384460,
    // 81-90级
    81: 68643504, 82: 91725112, 83: 100805844, 84: 109805844, 85: 118805844, 86: 127805844, 87: 136805844, 88: 145805844, 89: 154805844, 90: 163805844,
    // 91-100级
    91: 172805844, 92: 217465764, 93: 268545555, 94: 325456545, 95: 389655554, 96: 440000000, 97: 450000000, 98: 460000000, 99: 470000000, 100: 480000000,
    // N:缺少101-130的数据
    101: 0
}