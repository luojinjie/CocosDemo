// === enum ===

/**
 * 道具类型
 */
export enum PropType {
    PT_Evolution = 1, // 进化
    PT_Medicine = 2, // 药水
    PT_Giftbag = 3, // 礼包
    PT_Special = 4, // 特殊
    PT_Synthetic = 5, // 合成
    PT_Nirvana = 6, // 涅槃
    PT_Collection = 7, // 收集物
    PT_Pokeball = 8, // 精灵球
    PT_Petegg = 9, // 宠物卵
    PT_Gain = 10, // 增益
    PT_Scroll = 11, // 卷轴
    PT_Equip = 12, // 装备
    PT_Intensify = 13, // 强化石
    PT_Protect = 14, // 保护石
}

/**
 * 道具稀有度
 */
export enum PropRarity {
    PR_Ordinary = 1, // 普通
    PR_Superior = 2, // 高级
    PR_Rare = 3, // 稀有
    PR_Inherit = 4, // 传承
    PR_Legend = 5, // 传说
    PR_Epic = 6, // 史诗
    PR_Myth = 7, // 神话
}

// === class ===

/**
 * 道具信息
 */
export class PropData {
    public ID: number = 0 // 道具ID
    public Name: string = "" // 道具名
    public Type: number = 0 // 道具类型
    public Price: number = 0 // 基础售价(金币)
    public Rarity: number = 0 // 稀有度
    public Validity: Date = null // 有效期
    public Describe: string = "" // 描述
    public Tradable: boolean = false // 可否交易
    public Useable: boolean = false // 可否使用
    public Script: object = null // 关联脚本处理(JSON数据)
}

/**
 * 道具信息扩展
 */
export class PropDataEx {
    public ID: number = 0 // 道具ID
    public Count: number = 0 // 持有数量
    public Data: PropData = null // 道具信息
}

/**
 * 商品信息
 */
export class GoodsData {
    public ID: number = 0 // 道具ID
    public Sale: number = 0 // 销售单价
    public Currency: number = 0 // 货币类型
    public Data: PropData = null // 关联信息
}