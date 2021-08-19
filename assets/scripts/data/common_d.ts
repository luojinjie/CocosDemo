// === enum ===

/**
 * 货币类型
 */
export enum CurrencyType {
    CT_Gold = 1, // 金币
    CT_Ingot = 2, // 元宝
    CT_Crystal = 3, // 水晶
    CT_Prestige = 4, // 威望
}

/**
 * 容器类型
 */
export enum ContainerType {
    CT_Pack = 1, // 背包
    CT_Warehouse = 2, // 仓库
    CT_Ranch = 3, // 牧场
    CT_Carry = 4 // 携带(不可扩充)
}

/**
 * 特殊类型
 */
export enum SpecialType {
    ST_Container = 1, // 扩充容量
    ST_Multiple = 2, // 多倍经验
}

/**
 * 增益类型
 */
export enum GainType {
    GT_Prestige = 1, // 威望
    GT_Exp = 2, // 经验
}

/**
 * 效果类型
 */
export enum EffectType {
    ET_Defend = 1, // 保护
    ET_Addition = 2 // 加成
}