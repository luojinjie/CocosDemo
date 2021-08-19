import { PetNode } from "../data/pet_d"
import { Json2Tmp } from "../util/json"
import { StrFmt } from "../util/string"

/**
 * 宠物进化库(树)
 */
export class EvolveLib {
    private nodes: { [id: number]: PetNode } = {} // 宠物进化信息节点集合

    /**
     * 加载进化树节点
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
            // 构建节点
            let node = new PetNode()

            // 解析节点信息
            if (!Json2Tmp(node, ps[i])) {
                console.error("FromJson:解析节点信息失败")
                return
            }

            // 记录节点
            this.nodes[node.ID] = node
        }

        // 构建进化树
        this.createTree()

        return null
    }

    /**
     * 获取宠物进化节点
     * @param id 宠物ID
     * @returns 宠物进化节点
     */
    public GetNode(id: number): PetNode {
        return this.nodes[id]
    }

    public Getnodes() {
        return this.nodes
    }

    // === 私有方法处理 ===

    /**
     * 构建进化树
     */
    private createTree() {
        for (let k in this.nodes) {
            let target = this.nodes[k]

            // 关联A线路子节点
            if (target.AID) {
                target.AChild = this.nodes[target.AID]
            }

            // 关联B线路子节点
            if (target.BID) {
                target.BChild = this.nodes[target.BID]
            }
        }
    }
}

/**
 * 获取进化库对象
 * @returns 管理对象
 */
export function GetEvolveLib(): EvolveLib {
    return evolveLib
}

/**
 * 进化树信息
 */
let evolves = [
    // 金系进化树
    { ID: 0x10001, AID: 0x10002, BID: 0x10003, AProp: 0x10001, BProp: 0x10002, ALevel: 5, BLevel: 15 }, // 金波姆
    { ID: 0x10002, AID: 0x10003, BID: 0x10004, AProp: 0x10002, BProp: 0x10003, ALevel: 15, BLevel: 25 }, // 波光姆
    { ID: 0x10003, AID: 0x10007, BID: 0x10004, AProp: 0x11001, BProp: 0x11002, ALevel: 25, BLevel: 35 }, // 金波姆王
    { ID: 0x10004, AID: 0x1000E, BID: 0x1000E, AProp: 0x10002, BProp: 0x10003, ALevel: 25, BLevel: 35 }, // 黄金鸟
    { ID: 0x10005, AID: 0x10007, BID: 0x10007, AProp: 0x10001, BProp: 0x10003, ALevel: 15, BLevel: 25 }, // 金光鼠
    { ID: 0x10006, AID: 0x10008, BID: 0x1000B, AProp: 0x10002, BProp: 0x11003, ALevel: 15, BLevel: 25 }, // 光驹
    { ID: 0x10007, AID: 0x10009, BID: 0x10009, AProp: 0x10002, BProp: 0x10003, ALevel: 25, BLevel: 35 }, // 雷光鼠
    { ID: 0x10008, AID: 0x1000B, BID: 0x1000B, AProp: 0x10003, BProp: 0x11003, ALevel: 25, BLevel: 35 }, // 黄金独角兽
    { ID: 0x10009, AID: 0x1000B, BID: 0x1000C, AProp: 0x11003, BProp: 0x11004, ALevel: 35, BLevel: 45 }, // 雷炎鼠
    { ID: 0x1000A, AID: 0x1000C, BID: 0x10010, AProp: 0x11004, BProp: 0x11005, ALevel: 25, BLevel: 35 }, // 流氓奶牛
    { ID: 0x1000B, AID: 0x1000E, BID: 0x1000E, AProp: 0x10003, BProp: 0x11006, ALevel: 35, BLevel: 45 }, // 圣洁独角兽
    { ID: 0x1000C, AID: 0x1000E, BID: 0x1000E, AProp: 0x10003, BProp: 0x11006, ALevel: 30, BLevel: 40 }, // 紫貘
    { ID: 0x1000D, AID: 0x10006, BID: 0x10011, AProp: 0x10004, BProp: 0x10005, ALevel: 30, BLevel: 40 }, // 黄金蝙蝠
    { ID: 0x1000E, BID: 0x1000F, AProp: 0x10004, BProp: 0x11007, ALevel: 25, BLevel: 35 }, // 圣羽天马
    { ID: 0x1000F, AID: 0x10013, BID: 0x10013, AProp: 0x11008, BProp: 0x11008, ALevel: 25, BLevel: 35 }, // 兽王
    { ID: 0x10010, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 恶魔波姆
    { ID: 0x10011, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 黄金鸟教皇
    { ID: 0x10012, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 金龙霸王
    { ID: 0x10013, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 兽王神

    // 木系进化树
    { ID: 0x20001, AID: 0x20002, BID: 0x20003, AProp: 0x10001, BProp: 0x10002, ALevel: 5, BLevel: 15 }, // 绿波姆
    { ID: 0x20002, AID: 0x20003, BID: 0x20004, AProp: 0x10002, BProp: 0x10003, ALevel: 15, BLevel: 25 }, // 波碧姆
    { ID: 0x20003, AID: 0x20004, BID: 0x20006, AProp: 0x12001, BProp: 0x12002, ALevel: 25, BLevel: 35 }, // 绿波姆王
    { ID: 0x20004, AID: 0x20006, BID: 0x20005, AProp: 0x10001, BProp: 0x12003, ALevel: 15, BLevel: 25 }, // 碧蟾
    { ID: 0x20005, AID: 0x20009, BID: 0x20009, AProp: 0x10003, BProp: 0x12004, ALevel: 15, BLevel: 25 }, // 弹簧蛇
    { ID: 0x20006, AID: 0x20007, BID: 0x20005, AProp: 0x10001, BProp: 0x12003, ALevel: 25, BLevel: 35 }, // 老爷蛙
    { ID: 0x20007, AID: 0x2000B, BID: 0x2000C, AProp: 0x12005, BProp: 0x12006, ALevel: 35, BLevel: 45 }, // 紫冥蟾
    { ID: 0x20008, AID: 0x2000A, BID: 0x2000E, AProp: 0x10002, BProp: 0x10003, ALevel: 25, BLevel: 35 }, // 紫木蝎
    { ID: 0x20009, AID: 0x2000C, BID: 0x2000F, AProp: 0x12006, BProp: 0x12007, ALevel: 25, BLevel: 35 }, // 化蛇王
    { ID: 0x2000A, AID: 0x20009, BID: 0x2000C, AProp: 0x12004, BProp: 0x12006, ALevel: 25, BLevel: 35 }, // 贪食蛇
    { ID: 0x2000B, BID: 0x2000D, AProp: 0x10004, BProp: 0x12008, ALevel: 25, BLevel: 35 }, // 调皮的雪孩子
    { ID: 0x2000C, AID: 0x2000F, BID: 0x2000F, AProp: 0x10003, BProp: 0x12007, ALevel: 25, BLevel: 35 }, // 青龙兽
    { ID: 0x2000D, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 花叶童子
    { ID: 0x2000E, AID: 0x2000D, BID: 0x20010, AProp: 0x12009, BProp: 0x1200A, ALevel: 25, BLevel: 35 }, // 恶魔鸟
    { ID: 0x2000F, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 青蛟
    { ID: 0x20010, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 梦魇
    { ID: 0x20011, AID: 0x20012, BID: 0x20012, AProp: 0x10003, BProp: 0x1200B, ALevel: 30, BLevel: 50 }, // 小青龙琅琅
    { ID: 0x20012, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 青龙琅琅

    // 水系进化树
    { ID: 0x30001, AID: 0x30002, BID: 0x30003, AProp: 0x10001, BProp: 0x10002, ALevel: 5, BLevel: 15 }, // 水波姆
    { ID: 0x30002, AID: 0x30003, BID: 0x30004, AProp: 0x10002, BProp: 0x10003, ALevel: 15, BLevel: 25 }, // 波波姆
    { ID: 0x30003, AID: 0x30004, BID: 0x30005, AProp: 0x13001, BProp: 0x13002, ALevel: 25, BLevel: 35 }, // 水波姆王
    { ID: 0x30004, AID: 0x30006, BID: 0x30007, AProp: 0x10001, BProp: 0x10003, ALevel: 15, BLevel: 25 }, // 水仙
    { ID: 0x30005, AID: 0x30008, AProp: 0x13003, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 冰石机
    { ID: 0x30006, AID: 0x30007, BID: 0x3000A, AProp: 0x10002, BProp: 0x13004, ALevel: 25, BLevel: 35 }, // 雪芙
    { ID: 0x30007, AID: 0x3000A, BID: 0x3000B, AProp: 0x13004, BProp: 0x13005, ALevel: 35, BLevel: 45 }, // 冰露
    { ID: 0x30008, BID: 0x3000D, AProp: 0x10004, BProp: 0x13006, ALevel: 25, BLevel: 35 }, // 冰波姆
    { ID: 0x30009, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 寄居蟹
    { ID: 0x3000A, AID: 0x3000C, BID: 0x3000C, AProp: 0x10002, BProp: 0x13007, ALevel: 35, BLevel: 45 }, // 雪蝶兽
    { ID: 0x3000B, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 爱丽丝
    { ID: 0x3000C, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 飞羽龟
    { ID: 0x3000D, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 天使波姆
    { ID: 0x3000E, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 梦幻猫
    { ID: 0x3000F, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 艾薇儿
    { ID: 0x30010, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 冰龙苍海

    // 火系进化树
    { ID: 0x40001, AID: 0x40002, BID: 0x40003, AProp: 0x10001, BProp: 0x10002, ALevel: 5, BLevel: 15 }, // 火波姆
    { ID: 0x40002, AID: 0x40003, BID: 0x40006, AProp: 0x10002, BProp: 0x10003, ALevel: 15, BLevel: 25 }, // 波纳姆
    { ID: 0x40003, AID: 0x40004, BID: 0x40006, AProp: 0x14001, BProp: 0x14002, ALevel: 25, BLevel: 35 }, // 火波姆王
    { ID: 0x40004, AID: 0x40005, BID: 0x40006, AProp: 0x10001, BProp: 0x14002, ALevel: 15, BLevel: 25 }, // 火芒
    { ID: 0x40005, AID: 0x40007, BID: 0x4000A, AProp: 0x14003, BProp: 0x14004, ALevel: 25, BLevel: 35 }, // 吸血蚊
    { ID: 0x40006, AID: 0x40008, BID: 0x40008, AProp: 0x10003, BProp: 0x14005, ALevel: 15, BLevel: 25 }, // 火龙蛋
    { ID: 0x40007, AID: 0x4000B, BID: 0x4000A, AProp: 0x10002, BProp: 0x14004, ALevel: 15, BLevel: 25 }, // 赤锦
    { ID: 0x40008, AID: 0x4000C, BID: 0x4000C, AProp: 0x10002, BProp: 0x14006, ALevel: 25, BLevel: 35 }, // 血炎兽
    { ID: 0x40009, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 赌博鼠
    { ID: 0x4000A, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 火羽
    { ID: 0x4000B, AID: 0x4000D, BID: 0x4000D, AProp: 0x10002, BProp: 0x14007, ALevel: 25, BLevel: 35 }, // 赤爪青鸾
    { ID: 0x4000C, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 猞猁猫
    { ID: 0x4000D, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 火焰蝙蝠
    { ID: 0x4000E, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 火岩兽
    { ID: 0x4000F, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 火灵猴
    { ID: 0x40010, AID: 0x40011, BID: 0x40011, AProp: 0x10002, BProp: 0x14008, ALevel: 35, BLevel: 45 }, // 狐仙莫莫
    { ID: 0x40011, AID: 0x40012, BID: 0x40012, AProp: 0x10002, BProp: 0x14008, ALevel: 35, BLevel: 45 }, // 三尾忍忍
    { ID: 0x40012, AID: 0x40013, BID: 0x40013, AProp: 0x10002, BProp: 0x14008, ALevel: 35, BLevel: 45 }, // 仙狐六尾
    { ID: 0x40013, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 天狐莫姬
    { ID: 0x40014, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 炎龙血焰

    // 土系进化树
    { ID: 0x50001, AID: 0x50002, BID: 0x50003, AProp: 0x10001, BProp: 0x10002, ALevel: 5, BLevel: 15 }, // 土波姆
    { ID: 0x50002, AID: 0x50003, BID: 0x50004, AProp: 0x10002, BProp: 0x10003, ALevel: 15, BLevel: 25 }, // 波岩姆
    { ID: 0x50003, AID: 0x50004, BID: 0x50008, AProp: 0x10002, BProp: 0x15001, ALevel: 25, BLevel: 35 }, // 土波姆王
    { ID: 0x50004, AID: 0x50005, BID: 0x50007, AProp: 0x10001, BProp: 0x10002, ALevel: 15, BLevel: 25 }, // 魔岩卵
    { ID: 0x50005, AID: 0x50007, BID: 0x50007, AProp: 0x10002, BProp: 0x10003, ALevel: 25, BLevel: 35 }, // 黑蚁
    { ID: 0x50006, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 水晶圣甲虫
    { ID: 0x50007, AID: 0x5000A, BID: 0x5000A, AProp: 0x10002, BProp: 0x15002, ALevel: 35, BLevel: 45 }, // 蚂蚁守卫
    { ID: 0x50008, AID: 0x5000B, BID: 0x5000C, AProp: 0x10002, BProp: 0x15003, ALevel: 15, BLevel: 25 }, // 波姆兔
    { ID: 0x50009, AID: 0x5000A, BID: 0x5000A, AProp: 0x10002, BProp: 0x15002, ALevel: 25, BLevel: 35 }, // 香蕉猴
    { ID: 0x5000A, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 岩兽人
    { ID: 0x5000B, AID: 0x5000C, BID: 0x5000F, AProp: 0x15003, BProp: 0x15004, ALevel: 25, BLevel: 35 }, // 波姆兔王
    { ID: 0x5000C, AID: 0x5000F, BID: 0x5000F, AProp: 0x10003, BProp: 0x15004, ALevel: 35, BLevel: 45 }, // 月亮兔
    { ID: 0x5000D, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 中山狼
    { ID: 0x5000E, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 玛雅
    { ID: 0x5000F, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 战神兔
    { ID: 0x50010, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 天蚁
    { ID: 0x50011, AProp: 0x10004, BProp: 0x10005, ALevel: 25, BLevel: 35 }, // 黄龙莫虚

    // 神系进化树
    { ID: 0x60001, AProp: 0x10006, BProp: 0x10007, ALevel: 40, BLevel: 60 }, // 小神龙琅琊
    { ID: 0x60002, AProp: 0x10006, BProp: 0x10007, ALevel: 40, BLevel: 60 }, // 白虎
    { ID: 0x60003, AProp: 0x10006, BProp: 0x10007, ALevel: 40, BLevel: 60 }, // 青龙
    { ID: 0x60004, AProp: 0x10006, BProp: 0x10007, ALevel: 40, BLevel: 60 }, // 破天虎
    { ID: 0x60005, AProp: 0x10006, BProp: 0x10007, ALevel: 40, BLevel: 60 }, // 龙蛇玄武
    // 涅槃兽
    { ID: 0x66666, AProp: 0x10006, BProp: 0x10007, ALevel: 40, BLevel: 60 }, // 涅槃兽
]

/**
 * 进化库
 */
let evolveLib: EvolveLib = new EvolveLib()
evolveLib.FromJson(JSON.stringify(evolves))
console.log(evolveLib)