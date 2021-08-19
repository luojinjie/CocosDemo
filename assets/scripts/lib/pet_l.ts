import { PetData, PetStage } from "../data/pet_d"
import { DeepClone } from "../util/clone"
import { Json2Tmp } from "../util/json"
import { StrFmt } from "../util/string"
import { GetEvolveLib } from "./evolve_l"

/**
 * 宠物库
 */
export class PetLib {
    private petList: { [id: number]: PetData } = {} // 宠物列表

    /**
     * 加载宠物列表
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
            // 构建宠物
            let pet = new PetData()

            // 解析宠物信息
            if (!Json2Tmp(pet, ps[i])) {
                console.error("FromJson:解析宠物信息失败")
                return
            }

            // 绑定节点信息
            pet.Node = GetEvolveLib().GetNode(pet.ID)

            // 记录宠物
            this.petList[pet.ID] = pet
        }
    }

    /**
     * 获取指定宠物
     * @param id 宠物ID
     * @returns 宠物信息
     */
    public GetPet(id: number): PetData {
        // N:本地引用类型数据,需要深拷贝
        // return this.petList[id]
        return DeepClone(this.petList[id])
    }

    /**
     * 获取下一阶宠物ID
     * @param id 宠物ID
     * @returns 宠物信息
     */
    public GetNextStage(id: number): PetData {
        // 校验阶级
        let pet = this.petList[id]
        if (pet.Stage == PetStage.PS_Ten) {
            return null
        }

        // 同系别下一阶宠物列表
        let list = this.getNextPetsByDept(pet.Dept, pet.Stage + 1)
        // 随机获取
        let index = Math.floor(Math.random() * list.length)

        return list[index]
    }

    /**
     * 获取同系别下一阶宠物列表
     * @param dept 宠物系别
     * @returns 宠物列表
     */
    private getNextPetsByDept(dept: number, stage: number): PetData[] {
        let list = []
        for (let k in this.petList) {
            if (this.petList[k].Dept == dept && this.petList[k].Stage == stage) {
                list.push(this.petList[k])
            }
        }

        return list
    }
}

/**
 * 获取宠物库对象
 * @returns 管理对象
 */
export function GetPetLib(): PetLib {
    return petLib
}

/**
 * 涅槃兽ID
 */
export const AssistPetID = 0x66666

// === === ===

/**
 * 所有宠物信息
 */
let pets = [
    // 金系
    { ID: 0x10001, Name: "金波姆", Dept: 1, Stage: 1, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 1 },
    { ID: 0x10002, Name: "波光姆", Dept: 1, Stage: 2, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 2 },
    { ID: 0x10003, Name: "金波姆王", Dept: 1, Stage: 3, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 3 },
    { ID: 0x10004, Name: "黄金鸟", Dept: 1, Stage: 4, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 4 },
    { ID: 0x10005, Name: "金光鼠", Dept: 1, Stage: 4, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 4 },
    { ID: 0x10006, Name: "光驹", Dept: 1, Stage: 5, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 5 },
    { ID: 0x10007, Name: "雷光鼠", Dept: 1, Stage: 5, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 5 },
    { ID: 0x10008, Name: "黄金独角兽", Dept: 1, Stage: 6, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 6 },
    { ID: 0x10009, Name: "雷炎鼠", Dept: 1, Stage: 6, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 6 },
    { ID: 0x1000A, Name: "流氓奶牛", Dept: 1, Stage: 6, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 6 },
    { ID: 0x1000B, Name: "圣洁独角兽", Dept: 1, Stage: 7, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 7 },
    { ID: 0x1000C, Name: "紫貘", Dept: 1, Stage: 7, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 7 },
    { ID: 0x1000D, Name: "黄金蝙蝠", Dept: 1, Stage: 7, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 7 },
    { ID: 0x1000E, Name: "圣羽天马", Dept: 1, Stage: 8, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 8 },
    { ID: 0x1000F, Name: "兽王", Dept: 1, Stage: 9, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 9 },
    { ID: 0x10010, Name: "恶魔波姆", Dept: 1, Stage: 9, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 9 },
    { ID: 0x10011, Name: "黄金鸟教皇", Dept: 1, Stage: 9, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 9 },
    { ID: 0x10012, Name: "金龙霸王", Dept: 1, Stage: 10, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 10 },
    { ID: 0x10013, Name: "兽王神", Dept: 1, Stage: 10, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Growth: 10 },

    // 木系
    { ID: 0x20001, Name: "绿波姆", Dept: 2, Stage: 1, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 1 },
    { ID: 0x20002, Name: "波碧姆", Dept: 2, Stage: 2, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 2 },
    { ID: 0x20003, Name: "绿波姆王", Dept: 2, Stage: 3, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 3 },
    { ID: 0x20004, Name: "碧蟾", Dept: 2, Stage: 4, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 4 },
    { ID: 0x20005, Name: "弹簧蛇", Dept: 2, Stage: 5, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 5 },
    { ID: 0x20006, Name: "老爷蛙", Dept: 2, Stage: 5, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 5 },
    { ID: 0x20007, Name: "紫冥蟾", Dept: 2, Stage: 6, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 6 },
    { ID: 0x20008, Name: "紫木蝎", Dept: 2, Stage: 6, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 6 },
    { ID: 0x20009, Name: "化蛇王", Dept: 2, Stage: 7, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 7 },
    { ID: 0x2000A, Name: "贪食蛇", Dept: 2, Stage: 7, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 7 },
    { ID: 0x2000B, Name: "调皮的雪孩子", Dept: 2, Stage: 7, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 7 },
    { ID: 0x2000C, Name: "青龙兽", Dept: 2, Stage: 8, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 8 },
    { ID: 0x2000D, Name: "花叶童子", Dept: 2, Stage: 8, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 8 },
    { ID: 0x2000E, Name: "恶魔鸟", Dept: 2, Stage: 8, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 8 },
    { ID: 0x2000F, Name: "青蛟", Dept: 2, Stage: 9, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 9 },
    { ID: 0x20010, Name: "梦魇", Dept: 2, Stage: 9, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 9 },
    { ID: 0x20011, Name: "小青龙琅琅", Dept: 2, Stage: 10, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 10 },
    { ID: 0x20012, Name: "青龙琅琅", Dept: 2, Stage: 10, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Growth: 10 },

    // 水系
    { ID: 0x30001, Name: "水波姆", Dept: 3, Stage: 1, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 1 },
    { ID: 0x30002, Name: "波波姆", Dept: 3, Stage: 2, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 2 },
    { ID: 0x30003, Name: "水波姆王", Dept: 3, Stage: 3, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 3 },
    { ID: 0x30004, Name: "水仙", Dept: 3, Stage: 4, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 4 },
    { ID: 0x30005, Name: "冰石机", Dept: 3, Stage: 5, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 5 },
    { ID: 0x30006, Name: "雪芙", Dept: 3, Stage: 5, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 5 },
    { ID: 0x30007, Name: "冰露", Dept: 3, Stage: 6, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 6 },
    { ID: 0x30008, Name: "冰波姆", Dept: 3, Stage: 7, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 7 },
    { ID: 0x30009, Name: "寄居蟹", Dept: 3, Stage: 7, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 7 },
    { ID: 0x3000A, Name: "雪蝶兽", Dept: 3, Stage: 7, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 7 },
    { ID: 0x3000B, Name: "爱丽丝", Dept: 3, Stage: 8, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 8 },
    { ID: 0x3000C, Name: "飞羽龟", Dept: 3, Stage: 8, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 8 },
    { ID: 0x3000D, Name: "天使波姆", Dept: 3, Stage: 3, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 9 },
    { ID: 0x3000E, Name: "梦幻猫", Dept: 3, Stage: 3, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 9 },
    { ID: 0x3000F, Name: "艾薇儿", Dept: 3, Stage: 10, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 10 },
    { ID: 0x30010, Name: "冰龙苍海", Dept: 3, Stage: 10, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Growth: 10 },

    // 火系
    { ID: 0x40001, Name: "火波姆", Dept: 4, Stage: 1, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 1 },
    { ID: 0x40002, Name: "波纳姆", Dept: 4, Stage: 2, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 2 },
    { ID: 0x40003, Name: "火波姆王", Dept: 4, Stage: 3, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 3 },
    { ID: 0x40004, Name: "火芒", Dept: 4, Stage: 4, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 4 },
    { ID: 0x40005, Name: "吸血蚊", Dept: 4, Stage: 5, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 5 },
    { ID: 0x40006, Name: "火龙蛋", Dept: 4, Stage: 5, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 5 },
    { ID: 0x40007, Name: "赤锦", Dept: 4, Stage: 6, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 6 },
    { ID: 0x40008, Name: "血炎兽", Dept: 4, Stage: 6, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 6 },
    { ID: 0x40009, Name: "赌博鼠", Dept: 4, Stage: 6, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 6 },
    { ID: 0x4000A, Name: "火羽", Dept: 4, Stage: 7, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 7 },
    { ID: 0x4000B, Name: "赤爪青鸾", Dept: 4, Stage: 7, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 7 },
    { ID: 0x4000C, Name: "猞猁猫", Dept: 4, Stage: 7, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 7 },
    { ID: 0x4000D, Name: "火焰蝙蝠", Dept: 4, Stage: 8, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 8 },
    { ID: 0x4000E, Name: "火岩兽", Dept: 4, Stage: 8, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 8 },
    { ID: 0x4000F, Name: "火灵猴", Dept: 4, Stage: 9, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 9 },
    { ID: 0x40010, Name: "狐仙莫莫", Dept: 4, Stage: 9, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 9 },
    { ID: 0x40011, Name: "三尾忍忍", Dept: 4, Stage: 10, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 10 },
    { ID: 0x40012, Name: "仙狐六尾", Dept: 4, Stage: 10, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 10 },
    { ID: 0x40013, Name: "天狐莫姬", Dept: 4, Stage: 10, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 10 },
    { ID: 0x40014, Name: "炎龙血焰", Dept: 4, Stage: 10, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Growth: 10 },

    // 土系
    { ID: 0x50001, Name: "土波姆", Dept: 5, Stage: 1, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 1 },
    { ID: 0x50002, Name: "波岩姆", Dept: 5, Stage: 2, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 2 },
    { ID: 0x50003, Name: "土波姆王", Dept: 5, Stage: 3, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 3 },
    { ID: 0x50004, Name: "魔岩卵", Dept: 5, Stage: 4, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 4 },
    { ID: 0x50005, Name: "黑蚁", Dept: 5, Stage: 5, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 5 },
    { ID: 0x50006, Name: "水晶圣甲虫", Dept: 5, Stage: 6, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 6 },
    { ID: 0x50007, Name: "蚂蚁守卫", Dept: 5, Stage: 6, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 6 },
    { ID: 0x50008, Name: "波姆兔", Dept: 5, Stage: 6, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 6 },
    { ID: 0x50009, Name: "香蕉猴", Dept: 5, Stage: 6, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 6 },
    { ID: 0x5000A, Name: "岩兽人", Dept: 5, Stage: 7, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 7 },
    { ID: 0x5000B, Name: "波姆兔王", Dept: 5, Stage: 7, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 7 },
    { ID: 0x5000C, Name: "月亮兔", Dept: 5, Stage: 8, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 8 },
    { ID: 0x5000D, Name: "中山狼", Dept: 5, Stage: 8, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 8 },
    { ID: 0x5000E, Name: "玛雅", Dept: 5, Stage: 9, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 9 },
    { ID: 0x5000F, Name: "战神兔", Dept: 5, Stage: 9, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 9 },
    { ID: 0x50010, Name: "天蚁", Dept: 5, Stage: 10, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 10 },
    { ID: 0x50011, Name: "黄龙莫虚", Dept: 5, Stage: 10, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Growth: 10 },

    // 神系
    { ID: 0x60001, Name: "小神龙琅琊", Dept: 6, Stage: 11, BaseAttr: { HP: 8000, MP: 8000, Atk: 8000, Def: 8000, Hit: 8000, Dod: 8000, Spd: 8000 }, Growth: 60 },
    { ID: 0x60002, Name: "白虎", Dept: 6, Stage: 11, BaseAttr: { HP: 8000, MP: 8000, Atk: 8000, Def: 8000, Hit: 8000, Dod: 8000, Spd: 8000 }, Growth: 60 },
    { ID: 0x60003, Name: "青龙", Dept: 6, Stage: 11, BaseAttr: { HP: 8000, MP: 8000, Atk: 8000, Def: 8000, Hit: 8000, Dod: 8000, Spd: 8000 }, Growth: 60 },
    { ID: 0x60004, Name: "破天虎", Dept: 6, Stage: 11, BaseAttr: { HP: 8000, MP: 8000, Atk: 8000, Def: 8000, Hit: 8000, Dod: 8000, Spd: 8000 }, Growth: 60 },
    { ID: 0x60005, Name: "龙蛇玄武", Dept: 6, Stage: 11, BaseAttr: { HP: 8000, MP: 8000, Atk: 8000, Def: 8000, Hit: 8000, Dod: 8000, Spd: 8000 }, Growth: 60 },
    // 涅槃兽
    { ID: 0x66666, Name: "涅槃兽", Dept: 6, Stage: 11, BaseAttr: { HP: 1, MP: 1, Atk: 1, Def: 1, Hit: 1, Dod: 1, Spd: 1 }, Growth: 1 },
]

/**
 * 宠物库
 */
let petLib: PetLib = new PetLib()
petLib.FromJson(JSON.stringify(pets))
console.log(petLib)