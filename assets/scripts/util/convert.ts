import { PetDept } from "../data/pet_d";
import { PropRarity, PropType } from "../data/prop_d";

/**
 * 道具类型转换文本
 * @param type 道具类型
 * @returns 文本信息
 */
export function ConvertPropType(type: number): string {
    switch (type) {
        case PropType.PT_Evolution: // 进化
            return "进化类"
        case PropType.PT_Medicine: // 药水
            return "药水类"
        case PropType.PT_Giftbag: // 礼包
            return "礼包类"
        case PropType.PT_Special: // 特殊
            return "特殊类"
        case PropType.PT_Synthetic: // 合成
            return "合成类"
        case PropType.PT_Nirvana: // 涅槃
            return "涅槃类"
        case PropType.PT_Collection: // 收集物
            return "收集物"
        case PropType.PT_Pokeball: // 精灵球
            return "精灵球"
        case PropType.PT_Petegg: // 宠物卵
            return "宠物卵"
        case PropType.PT_Gain: // 增益
            return "增益类"
        case PropType.PT_Scroll: // 卷轴
            return "卷轴类"
        case PropType.PT_Equip: // 装备
            return "装备类"
        case PropType.PT_Intensify: // 强化石
            return "强化石"
        case PropType.PT_Protect: // 保护石
            return "保护石"
    }

    return null
}

/**
 * 稀有度转换颜色
 * @param rarity 稀有度
 * @returns 16进制颜色码
 */
export function ConvertRarity(rarity: number): string {
    switch (rarity) {
        case PropRarity.PR_Ordinary: // 普通
            return "#FFFFFF" // 白色
        case PropRarity.PR_Superior: // 高级
            return "#00FF00" // 绿色
        case PropRarity.PR_Rare: // 稀有
            return "#1E90FF" // 蓝色
        case PropRarity.PR_Inherit: // 传承
            return "#BA55D3" // 紫色
        case PropRarity.PR_Legend: // 传说
            return "#FFA500" // 橙色
        case PropRarity.PR_Epic: // 史诗
            return "#FFFF00" // 黄色
        case PropRarity.PR_Myth: // 神话
            return "#FF0000" // 红色
    }

    return null
}

/**
 * 宠物系别转换文本
 * @param dept 系别
 * @returns 文本信息
 */
export function ConvertDept(dept: number): string {
    switch (dept) {
        case PetDept.PD_Metal: // 金
            return "金"
        case PetDept.PD_Wood: // 木
            return "木"
        case PetDept.PD_Water: // 水
            return "水"
        case PetDept.PD_Fire: // 火
            return "火"
        case PetDept.PD_Earth: // 土
            return "土"
        case PetDept.PD_Deity: // 神
            return "神"
        case PetDept.PD_Holy: // 神圣
            return "神圣"
    }

    return null
}