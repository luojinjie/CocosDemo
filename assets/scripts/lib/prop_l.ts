import { CurrencyType } from "../data/common_d"
import { GoodsData, PropData } from "../data/prop_d"
import { Json2Tmp } from "../util/json"
import { StrFmt } from "../util/string"

/**
 * 道具库
 */
export class PropLib {
    private allList: { [id: number]: PropData } = {} // 所有道具列表
    private goldList: { [id: number]: GoodsData } = {} // 金币商店道具列表
    private ingotList: { [id: number]: GoodsData } = {} // 元宝商店道具列表
    private prestigeList: { [id: number]: GoodsData } = {} // 威望商店道具列表

    /**
     * 加载道具列表
     * @param json json数据
     * @returns 错误描述
     */
    public FromJson(json: string): string {
        // 解析json数据
        let ps: any = {}
        try {
            ps = JSON.parse(json)
            if (typeof ps !== "object" && !ps.sort) {
                throw "err"
            }
        } catch (e) {
            return StrFmt("FromJson:解析json数据失败(json:%v)", json)
        }

        // 加载列表
        for (let i = 0; i < ps.length; i++) {
            // 构建道具
            let prop = new PropData()

            // 解析道具信息
            if (!Json2Tmp(prop, ps[i])) {
                console.error("FromJson:解析道具信息失败")
                return
            }

            // 记录道具
            this.allList[prop.ID] = prop
        }

        // 加载商店道具
        this.loadGoods()

        return null
    }

    /**
     * 获取指定道具
     * @param id 道具ID
     * @returns 道具信息
     */
    public GetProp(id: number): PropData {
        return this.allList[id]
    }

    /**
     * 获取道具名
     * @param ids 道具ID
     * @returns 道具名
     */
    public GetPropName(ids: number[]): string[] {
        let names = []
        for (let i = 0; i < ids.length; i++) {
            names.push(this.allList[ids[i]].Name)
        }

        return names
    }

    /**
     * 获取商品列表
     * @param type 货币类型
     * @returns 商品列表
     */
    public GetGoodsList(type: number): { [id: number]: GoodsData } {
        switch (type) {
            case CurrencyType.CT_Gold:
                return this.goldList
            case CurrencyType.CT_Ingot:
                return this.ingotList
            case CurrencyType.CT_Prestige:
                return this.prestigeList
            default:
                return null
        }
    }

    // === 私有方法处理 ===

    /**
     * 加载商店道具
     */
    private loadGoods() {
        for (let i = 0; i < list.length; i++) {
            // 构造商品信息
            let goods = new GoodsData()

            // 解析商品信息
            if (!Json2Tmp(goods, list[i])) {
                console.error("loadGoods:解析商品信息失败")
                return
            }

            // 关联道具
            goods.Data = this.GetProp(goods.ID)

            switch (goods.Currency) {
                case CurrencyType.CT_Gold:
                    this.goldList[goods.ID] = goods
                    break
                case CurrencyType.CT_Ingot:
                    this.ingotList[goods.ID] = goods
                    break
                case CurrencyType.CT_Prestige:
                    this.prestigeList[goods.ID] = goods
                    break
            }
        }
    }
}

/**
 * 获取道具库对象
 * @returns 管理对象
 */
export function GetPropLib(): PropLib {
    return propLib
}

// === === ===

/**
 * 所有道具信息
 */
let props = [
    // 进化类
    { ID: 0x10001, Name: "进化之书", Type: 1, Price: 1, Rarity: 2, Validity: null, Describe: "五系宠物进化时使用", Tradable: true, Useable: false, Script: { Min: 10, Max: 30 } },
    { ID: 0x10002, Name: "高级进化书", Type: 1, Price: 1, Rarity: 2, Validity: null, Describe: "五系宠物高级进化时使用", Tradable: true, Useable: false, Script: { Min: 20, Max: 30 } },
    { ID: 0x10003, Name: "超级进化书", Type: 1, Price: 1, Rarity: 2, Validity: null, Describe: "五系宠物超级进化时使用", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x10004, Name: "强化丹A", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "进化增加0.1-1成长", Tradable: true, Useable: false, Script: { Min: 10, Max: 100 } },
    { ID: 0x10005, Name: "强化丹B", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "进化增加0.5-1.5成长", Tradable: true, Useable: false, Script: { Min: 50, Max: 150 } },
    { ID: 0x10006, Name: "玉露结晶", Type: 1, Price: 1, Rarity: 4, Validity: null, Describe: "进化增加0.1-0.3成长", Tradable: true, Useable: false, Script: { Min: 10, Max: 30 } },
    { ID: 0x10007, Name: "天仙玉露", Type: 1, Price: 1, Rarity: 5, Validity: null, Describe: "进化增加0.2-0.6成长", Tradable: true, Useable: false, Script: { Min: 20, Max: 60 } },
    // 金系
    { ID: 0x11001, Name: "雷光球", Type: 1, Price: 1, Rarity: 2, Validity: null, Describe: "金系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 20, Max: 30 } },
    { ID: 0x11002, Name: "黄金卵", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "金系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x11003, Name: "圣洁之角", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "金系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x11004, Name: "紫貘之珠", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "金系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x11005, Name: "恶魔的心脏", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "金系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x11006, Name: "天马圣羽", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "金系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x11007, Name: "兽王的野心", Type: 1, Price: 1, Rarity: 4, Validity: null, Describe: "金系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x11008, Name: "兽王之心", Type: 1, Price: 1, Rarity: 4, Validity: null, Describe: "金系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    // 木系
    { ID: 0x12001, Name: "碧幽荷", Type: 1, Price: 1, Rarity: 2, Validity: null, Describe: "木系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 20, Max: 30 } },
    { ID: 0x12002, Name: "老爷路牌", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "木系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x12003, Name: "弹簧", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "木系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x12004, Name: "恶魔翼", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "木系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x12005, Name: "冰淇淋", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "木系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x12006, Name: "青龙珠", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "木系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x12007, Name: "青蛟之魂", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "木系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x12008, Name: "防晒霜", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "木系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x12009, Name: "巨型花苞", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "木系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x1200A, Name: "恶魔的怀表", Type: 1, Price: 1, Rarity: 4, Validity: null, Describe: "木系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x1200B, Name: "龙之秘籍", Type: 1, Price: 1, Rarity: 4, Validity: null, Describe: "木系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    // 水系
    { ID: 0x13001, Name: "水仙花", Type: 1, Price: 1, Rarity: 2, Validity: null, Describe: "水系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 20, Max: 30 } },
    { ID: 0x13002, Name: "能量水晶", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "水系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x13003, Name: "电灯泡", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "水系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x13004, Name: "雪蝶徽章", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "水系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x13005, Name: "妖精之泪", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "水系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x13006, Name: "天使光环", Type: 1, Price: 1, Rarity: 4, Validity: null, Describe: "水系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x13007, Name: "飞羽龟甲", Type: 1, Price: 1, Rarity: 4, Validity: null, Describe: "水系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    // 火系
    { ID: 0x14001, Name: "火光球", Type: 1, Price: 1, Rarity: 2, Validity: null, Describe: "火系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 20, Max: 30 } },
    { ID: 0x14002, Name: "火龙指甲", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "火系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x14003, Name: "五色羽毛", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "火系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 20, Max: 30 } },
    { ID: 0x14004, Name: "火凤之羽", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "火系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x14005, Name: "血炎之心", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "火系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 20, Max: 30 } },
    { ID: 0x14006, Name: "舍利子", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "火系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x14007, Name: "蝙蝠翅膀", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "火系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x14008, Name: "狐仙秘籍", Type: 1, Price: 1, Rarity: 4, Validity: null, Describe: "火系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    // 土系
    { ID: 0x15001, Name: "四叶草", Type: 1, Price: 1, Rarity: 2, Validity: null, Describe: "土系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 20, Max: 30 } },
    { ID: 0x15002, Name: "岩石水晶", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "土系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },
    { ID: 0x15003, Name: "月亮水晶", Type: 1, Price: 1, Rarity: 3, Validity: null, Describe: "土系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 20, Max: 30 } },
    { ID: 0x15004, Name: "战神之盔", Type: 1, Price: 1, Rarity: 4, Validity: null, Describe: "土系宠物进化道具", Tradable: true, Useable: false, Script: { Min: 30, Max: 50 } },

    // 药水类
    { ID: 0x20001, Name: "治疗药水", Type: 2, Price: 1, Rarity: 1, Validity: null, Describe: "战斗中回复生命值", Tradable: true, Useable: false, Script: { Value: 100 } },

    // 礼包类
    { ID: 0x30001, Name: "惊喜礼包", Type: 3, Price: 1, Rarity: 5, Validity: null, Describe: "充满着惊喜的礼包,快打开来看看吧!", Tradable: false, Useable: true, Script: { IDs: [0x40001, 0x40002, 0x40003, 0x40004, 0x40005, 0x40006, 0x40007, 0x40008, 0x40009, 0x4000A, 0x4000B, 0x4000C, 0x50005], Rate: [18, 18, 18, 8, 8, 8, 5, 5, 5, 2, 2, 2, 1] } },

    // 特殊类
    { ID: 0x40001, Name: "背包升级卷", Type: 4, Price: 1, Rarity: 2, Validity: null, Describe: "可以提升6格背包上限,最大可以提升至96格", Tradable: true, Useable: true, Script: { SType: 1, CType: 1, Stage: 1 } },
    { ID: 0x40002, Name: "仓库升级卷", Type: 4, Price: 1, Rarity: 2, Validity: null, Describe: "可以提升6格仓库上限,最大可以提升至96格", Tradable: true, Useable: true, Script: { SType: 1, CType: 2, Stage: 1 } },
    { ID: 0x40003, Name: "牧场升级卷", Type: 4, Price: 1, Rarity: 2, Validity: null, Describe: "可以提升1格牧场上限,最大可以提升至40格", Tradable: true, Useable: true, Script: { SType: 1, CType: 3, Stage: 1 } },
    { ID: 0x40004, Name: "高级背包升级卷", Type: 4, Price: 1, Rarity: 3, Validity: null, Describe: "可以使已经扩充至96格的背包再次提升6格上限,最大可以提升至150格", Tradable: true, Useable: true, Script: { SType: 1, CType: 1, Stage: 2 } },
    { ID: 0x40005, Name: "高级仓库升级卷", Type: 4, Price: 1, Rarity: 3, Validity: null, Describe: "可以使已经扩充至96格的仓库再次提升6格上限,最大可以提升至150格", Tradable: true, Useable: true, Script: { SType: 1, CType: 2, Stage: 2 } },
    { ID: 0x40006, Name: "高级牧场升级卷", Type: 4, Price: 1, Rarity: 3, Validity: null, Describe: "可以使已经扩充至40格的牧场再次提升1格上限,最大可以提升至80格", Tradable: true, Useable: true, Script: { SType: 1, CType: 3, Stage: 2 } },
    { ID: 0x40007, Name: "★背包升级卷", Type: 4, Price: 1, Rarity: 4, Validity: null, Describe: "可以使已经扩充至150格的背包再次提升5格上限,最大可以提升至200格", Tradable: true, Useable: true, Script: { SType: 1, CType: 1, Stage: 3 } },
    { ID: 0x40008, Name: "★仓库升级卷", Type: 4, Price: 1, Rarity: 4, Validity: null, Describe: "可以使已经扩充至150格的仓库再次提升5格上限,最大可以提升至200格", Tradable: true, Useable: true, Script: { SType: 1, CType: 2, Stage: 3 } },
    { ID: 0x40009, Name: "★牧场升级卷", Type: 4, Price: 1, Rarity: 4, Validity: null, Describe: "可以使已经扩充至80格的牧场再次提升1格上限,最大可以提升至100格", Tradable: true, Useable: true, Script: { SType: 1, CType: 3, Stage: 3 } },
    { ID: 0x4000A, Name: "☆背包升级卷", Type: 4, Price: 1, Rarity: 5, Validity: null, Describe: "可以使已经扩充至200格的背包再次提升5格上限,最大可以提升至300格", Tradable: true, Useable: true, Script: { SType: 1, CType: 1, Stage: 4 } },
    { ID: 0x4000B, Name: "☆仓库升级卷", Type: 4, Price: 1, Rarity: 5, Validity: null, Describe: "可以使已经扩充至200格的仓库再次提升5格上限,最大可以提升至300格", Tradable: true, Useable: true, Script: { SType: 1, CType: 2, Stage: 4 } },
    { ID: 0x4000C, Name: "☆牧场升级卷", Type: 4, Price: 1, Rarity: 5, Validity: null, Describe: "可以使已经扩充至100格的牧场再次提升1格上限,最大可以提升至150格", Tradable: true, Useable: true, Script: { SType: 1, CType: 3, Stage: 4 } },

    { ID: 0x41001, Name: "2倍经验卷", Type: 4, Price: 1, Rarity: 2, Validity: null, Describe: "战斗胜利获得2倍经验", Tradable: true, Useable: true, Script: { SType: 2, Multi: 2 } },
    { ID: 0x41002, Name: "3倍经验卷", Type: 4, Price: 1, Rarity: 2, Validity: null, Describe: "战斗胜利获得3倍经验", Tradable: true, Useable: true, Script: { SType: 2, Multi: 3 } },

    { ID: 0x42001, Name: "新手基地钥匙", Type: 4, Price: 1, Rarity: 2, Validity: null, Describe: "用于解锁地图:新手基地", Tradable: true, Useable: false, Script: "" },
    { ID: 0x42002, Name: "妖精森林钥匙", Type: 4, Price: 1, Rarity: 2, Validity: null, Describe: "用于解锁地图:妖精森林", Tradable: true, Useable: false, Script: "" },

    // 合成类
    { ID: 0x50001, Name: "护宠仙石", Type: 5, Price: 1, Rarity: 2, Validity: null, Describe: "宠物合成失败时,保护副宠物不会消失", Tradable: false, Useable: false, Script: { Defend: true } },
    { ID: 0x50002, Name: "守宠仙石", Type: 5, Price: 1, Rarity: 2, Validity: null, Describe: "宠物合成失败时,保护副宠物不会消失", Tradable: true, Useable: false, Script: { Defend: true } },
    { ID: 0x50003, Name: "守护魂石", Type: 5, Price: 1, Rarity: 3, Validity: null, Describe: "宠物合成失败时,保护副宠物不会消失,并增加8%成长", Tradable: true, Useable: false, Script: { Defend: true, Add: 8 } },
    { ID: 0x50004, Name: "天神之石", Type: 5, Price: 1, Rarity: 4, Validity: null, Describe: "宠物合成失败时,保护副宠物不会消失,并增加15%成长", Tradable: true, Useable: false, Script: { Defend: true, Add: 15 } },
    { ID: 0x50005, Name: "至尊神石", Type: 5, Price: 1, Rarity: 5, Validity: null, Describe: "宠物合成必定成功,并增加40%成长", Tradable: true, Useable: false, Script: { Defend: true, Success: 1000, Add: 40 } },

    { ID: 0x58001, Name: "★成长魂石", Type: 5, Price: 1, Rarity: 3, Validity: null, Describe: "宠物合成时,增加10%成功率,并增加10%成长", Tradable: true, Useable: false, Script: { Defend: false, Success: 10, Add: 10 } },
    { ID: 0x58002, Name: "★★成长魂石", Type: 5, Price: 1, Rarity: 4, Validity: null, Describe: "宠物合成时,增加15%成功率,并增加15%成长", Tradable: true, Useable: false, Script: { Defend: false, Success: 15, Add: 15 } },
    { ID: 0x58003, Name: "★★★成长魂石", Type: 5, Price: 1, Rarity: 6, Validity: null, Describe: "宠物合成时,增加20%成功率,并增加20%成长", Tradable: true, Useable: false, Script: { Defend: false, Success: 20, Add: 20 } },

    // 转生类
    { ID: 0x60001, Name: "涅槃丹", Type: 6, Price: 1, Rarity: 4, Validity: null, Describe: "宠物转生失败时,保护涅槃兽不会消失,并增加30%成长", Tradable: true, Useable: false, Script: { Defend: true, Add: 30 } },
    { ID: 0x60002, Name: "涅槃神丹", Type: 6, Price: 1, Rarity: 5, Validity: null, Describe: "宠物转生必定成功,并增加15%成长", Tradable: true, Useable: false, Script: { Defend: true, Success: 1000, Add: 15 } },

    { ID: 0x68001, Name: "涅槃圣丹", Type: 6, Price: 1, Rarity: 7, Validity: null, Describe: "宠物转生时,增加100%成长", Tradable: false, Useable: false, Script: { Defend: false, Add: 100 } },
    { ID: 0x68002, Name: "普品涅成丹", Type: 6, Price: 1, Rarity: 2, Validity: null, Describe: "宠物转生时,增加5%成长", Tradable: true, Useable: false, Script: { Defend: false, Add: 5 } },
    { ID: 0x68003, Name: "一品涅成丹", Type: 6, Price: 1, Rarity: 3, Validity: null, Describe: "宠物转生时,增加8%成长", Tradable: true, Useable: false, Script: { Defend: false, Add: 8 } },
    { ID: 0x68004, Name: "上品涅成丹", Type: 6, Price: 1, Rarity: 4, Validity: null, Describe: "宠物转生时,增加10%成长", Tradable: true, Useable: false, Script: { Defend: false, Add: 10 } },
    { ID: 0x68005, Name: "极品涅成丹", Type: 6, Price: 1, Rarity: 5, Validity: null, Describe: "宠物转生时,增加15%成长", Tradable: true, Useable: false, Script: { Defend: false, Add: 15 } },

    // 收集类
    { ID: 0x70001, Name: "金之粉尘", Type: 7, Price: 1, Rarity: 1, Validity: null, Describe: "1级金系收集物", Tradable: true, Useable: false, Script: "" },
    { ID: 0x70002, Name: "木之粉尘", Type: 7, Price: 1, Rarity: 1, Validity: null, Describe: "1级木系收集物", Tradable: true, Useable: false, Script: "" },
    { ID: 0x70003, Name: "水之粉尘", Type: 7, Price: 1, Rarity: 1, Validity: null, Describe: "1级水系收集物", Tradable: true, Useable: false, Script: "" },
    { ID: 0x70004, Name: "火之粉尘", Type: 7, Price: 1, Rarity: 1, Validity: null, Describe: "1级火系收集物", Tradable: true, Useable: false, Script: "" },
    { ID: 0x70005, Name: "土之粉尘", Type: 7, Price: 1, Rarity: 1, Validity: null, Describe: "1级土系收集物", Tradable: true, Useable: false, Script: "" },

    // 精灵球
    { ID: 0x80001, Name: "金波姆·精灵球", Type: 8, Price: 1, Rarity: 3, Validity: null, Describe: "捕捉金波姆", Tradable: true, Useable: false, Script: { PID: 0x10001, Rate: 50 } },
    { ID: 0x80002, Name: "绿波姆·精灵球", Type: 8, Price: 1, Rarity: 3, Validity: null, Describe: "捕捉绿波姆", Tradable: true, Useable: false, Script: { PID: 0x20001, Rate: 50 } },
    { ID: 0x80003, Name: "水波姆·精灵球", Type: 8, Price: 1, Rarity: 3, Validity: null, Describe: "捕捉水波姆", Tradable: true, Useable: false, Script: { PID: 0x30001, Rate: 50 } },
    { ID: 0x80004, Name: "火波姆·精灵球", Type: 8, Price: 1, Rarity: 3, Validity: null, Describe: "捕捉火波姆", Tradable: true, Useable: false, Script: { PID: 0x40001, Rate: 50 } },
    { ID: 0x80005, Name: "土波姆·精灵球", Type: 8, Price: 1, Rarity: 3, Validity: null, Describe: "捕捉土波姆", Tradable: true, Useable: false, Script: { PID: 0x50001, Rate: 50 } },

    // 宠物卵
    { ID: 0x90001, Name: "金波姆之卵", Type: 9, Price: 1, Rarity: 3, Validity: null, Describe: "使用获得金波姆", Tradable: true, Useable: true, Script: { ID: 0x10001, Name: '金波姆', Dept: 1, Stage: 1, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 1 } },
    { ID: 0x90002, Name: "绿波姆之卵", Type: 9, Price: 1, Rarity: 3, Validity: null, Describe: "使用获得绿波姆", Tradable: true, Useable: true, Script: { ID: 0x20001, Name: '绿波姆', Dept: 2, Stage: 1, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 1 } },
    { ID: 0x90003, Name: "水波姆之卵", Type: 9, Price: 1, Rarity: 3, Validity: null, Describe: "使用获得水波姆", Tradable: true, Useable: true, Script: { ID: 0x30001, Name: '水波姆', Dept: 3, Stage: 1, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 1 } },
    { ID: 0x90004, Name: "火波姆之卵", Type: 9, Price: 1, Rarity: 3, Validity: null, Describe: "使用获得火波姆", Tradable: true, Useable: true, Script: { ID: 0x40001, Name: '火波姆', Dept: 4, Stage: 1, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 1 } },
    { ID: 0x90005, Name: "土波姆之卵", Type: 9, Price: 1, Rarity: 3, Validity: null, Describe: "使用获得土波姆", Tradable: true, Useable: true, Script: { ID: 0x50001, Name: '土波姆', Dept: 5, Stage: 1, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 1 } },

    { ID: 0x98001, Name: "小神龙琅琊之卵", Type: 9, Price: 1, Rarity: 5, Validity: null, Describe: "使用获得小神龙琅琊", Tradable: true, Useable: true, Script: { ID: 0x60001, Name: "小神龙琅琊", Dept: 6, Stage: 11, BaseAttr: { HP: 8000, MP: 8000, Atk: 8000, Def: 8000, Hit: 8000, Dod: 8000, Spd: 8000 }, Growth: 60 } },
    { ID: 0x98002, Name: "涅槃兽之卵", Type: 9, Price: 1, Rarity: 5, Validity: null, Describe: "使用获得涅槃兽", Tradable: true, Useable: true, Script: { ID: 0x66666, Name: "涅槃兽", Dept: 6, Stage: 11, BaseAttr: { HP: 1, MP: 1, Atk: 1, Def: 1, Hit: 1, Dod: 1, Spd: 1 }, Growth: 1 } },

    // 增益类
    { ID: 0xA0001, Name: "黑暗碎片", Type: 10, Price: 1, Rarity: 2, Validity: null, Describe: "增加1点威望", Tradable: false, Useable: true, Script: { GType: 1, Prestige: 1 } },
    { ID: 0xA0002, Name: "黑暗之石", Type: 10, Price: 1, Rarity: 3, Validity: null, Describe: "增加2点威望", Tradable: false, Useable: true, Script: { GType: 1, Prestige: 2 } },
    { ID: 0xA0003, Name: "黑暗结晶", Type: 10, Price: 1, Rarity: 4, Validity: null, Describe: "增加3点威望", Tradable: false, Useable: true, Script: { GType: 1, Prestige: 3 } },

    { ID: 0xA1001, Name: "好运奖券", Type: 10, Price: 1, Rarity: 1, Validity: null, Describe: "增加主战宠物500宠物经验", Tradable: false, Useable: true, Script: { GType: 2, Exp: 500 } },
    { ID: 0xA1002, Name: "牛奶", Type: 10, Price: 1, Rarity: 2, Validity: null, Describe: "增加主战宠物5000宠物经验", Tradable: true, Useable: true, Script: { GType: 2, Exp: 5000 } },
    { ID: 0xA1003, Name: "200w经验月饼", Type: 10, Price: 1, Rarity: 3, Validity: null, Describe: "增加主战宠物200w宠物经验", Tradable: true, Useable: true, Script: { GType: 2, Exp: 2000000 } },
    { ID: 0xA1004, Name: "500w经验月饼", Type: 10, Price: 1, Rarity: 3, Validity: null, Describe: "增加主战宠物500w宠物经验", Tradable: true, Useable: true, Script: { GType: 2, Exp: 5000000 } },
    { ID: 0xA1005, Name: "修炼宝册", Type: 10, Price: 1, Rarity: 4, Validity: null, Describe: "增加主战宠物5000w宠物经验", Tradable: true, Useable: true, Script: { GType: 2, Exp: 50000000 } },
    { ID: 0xA1006, Name: "修炼仙册", Type: 10, Price: 1, Rarity: 5, Validity: null, Describe: "增加主战宠物1e宠物经验", Tradable: true, Useable: true, Script: { GType: 2, Exp: 100000000 } },
    { ID: 0xA1007, Name: "修炼圣册", Type: 10, Price: 1, Rarity: 7, Validity: null, Describe: "增加主战宠物800e宠物经验", Tradable: true, Useable: true, Script: { GType: 2, Exp: 80000000000 } },
]

/**
 * 商店道具信息
 */
let list = [
    // 金币商店
    { ID: 0x10001, Sale: 100, Currency: 1 }, // 进化之书
    { ID: 0x10002, Sale: 500, Currency: 1 }, // 高级进化书
    { ID: 0x10003, Sale: 1000, Currency: 1 }, // 超级进化书

    { ID: 0x30001, Sale: 100000, Currency: 1 }, // 惊喜礼包

    { ID: 0x42001, Sale: 10000, Currency: 1 }, // 新手基地钥匙

    { ID: 0x50001, Sale: 5000, Currency: 1 }, // 护宠仙石
    { ID: 0x50004, Sale: 20000, Currency: 1 }, // 天神之石
    { ID: 0x50005, Sale: 100000, Currency: 1 }, // 至尊神石
    { ID: 0x58003, Sale: 50000, Currency: 1 }, // ★★★成长魂石

    { ID: 0x60001, Sale: 5000, Currency: 1 }, // 涅槃丹
    { ID: 0x60002, Sale: 100000, Currency: 1 }, // 涅槃神丹
    { ID: 0x68001, Sale: 100000, Currency: 1 }, // 涅槃圣丹
    { ID: 0x68004, Sale: 10000, Currency: 1 }, // 上品涅成丹
    { ID: 0x68005, Sale: 20000, Currency: 1 }, // 极品涅成丹

    { ID: 0x80001, Sale: 10000, Currency: 1 }, // 金波姆之卵
    { ID: 0x80002, Sale: 10000, Currency: 1 }, // 绿波姆之卵
    { ID: 0x80003, Sale: 10000, Currency: 1 }, // 水波姆之卵
    { ID: 0x80004, Sale: 10000, Currency: 1 }, // 火波姆之卵
    { ID: 0x80005, Sale: 10000, Currency: 1 }, // 土波姆之卵

    { ID: 0x90001, Sale: 10000, Currency: 1 }, // 金波姆之卵
    { ID: 0x90002, Sale: 10000, Currency: 1 }, // 绿波姆之卵
    { ID: 0x90003, Sale: 10000, Currency: 1 }, // 水波姆之卵
    { ID: 0x90004, Sale: 10000, Currency: 1 }, // 火波姆之卵
    { ID: 0x90005, Sale: 10000, Currency: 1 }, // 土波姆之卵
    { ID: 0x98001, Sale: 10000, Currency: 1 }, // 小神龙琅琊之卵
    { ID: 0x98002, Sale: 10000, Currency: 1 }, // 涅槃兽之卵

    { ID: 0xA0001, Sale: 1000, Currency: 1 }, // 黑暗碎片
    { ID: 0xA0002, Sale: 2000, Currency: 1 }, // 黑暗之石
    { ID: 0xA0003, Sale: 3000, Currency: 1 }, // 黑暗结晶
    { ID: 0xA1003, Sale: 20000, Currency: 1 }, // 200w经验月饼
    { ID: 0xA1004, Sale: 50000, Currency: 1 }, // 500w经验月饼
    { ID: 0xA1005, Sale: 100000, Currency: 1 }, // 修炼宝册
    { ID: 0xA1006, Sale: 200000, Currency: 1 }, // 修炼仙册
    { ID: 0xA1007, Sale: 500000, Currency: 1 }, // 修炼圣册

    // 威望商店
    { ID: 0x50001, Sale: 1000, Currency: 4 },
    { ID: 0x50002, Sale: 1000, Currency: 4 },
    { ID: 0x50003, Sale: 1000, Currency: 4 },
    { ID: 0x50004, Sale: 1000, Currency: 4 },
    { ID: 0x50005, Sale: 1000, Currency: 4 },

]

/**
 * 道具库
 */
let propLib: PropLib = new PropLib()
propLib.FromJson(JSON.stringify(props))
console.log(propLib)