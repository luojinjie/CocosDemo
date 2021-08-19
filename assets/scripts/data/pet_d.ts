// === enum ===

/**
 * 宠物阶数
 */
export enum PetStage {
    PS_One = 1, // 1阶
    PS_Two = 2, // 2阶
    PS_Three = 3, // 3阶
    PS_Four = 4, // 4阶
    PS_Five = 5, // 5阶
    PS_Six = 6, // 6阶
    PS_Seven = 7, // 7阶
    PS_Eight = 8, // 8阶
    PS_Nine = 9, // 9阶
    PS_Ten = 10, // 10阶
    PS_Deity = 11, // 11阶(神)
    PS_Holy = 12, // 12阶(神圣)
}

/**
 * 宠物系别
 */
export enum PetDept {
    PD_Metal = 1, // 金
    PD_Wood = 2, // 木
    PD_Water = 3, // 水
    PD_Fire = 4, // 火
    PD_Earth = 5, // 土
    PD_Deity = 6, // 神
    PD_Holy = 7, // 神圣
}

// === class ===

/**
 * 宠物属性
 */
export class PetAttr {
    public HP: number = 0 // 生命
    public MP: number = 0 // 魔法
    public Atk: number = 0 // 攻击
    public Def: number = 0 // 防御
    public Hit: number = 0 // 命中
    public Dod: number = 0 // 闪避
    public Spd: number = 0 // 速度
}

/**
 * 宠物信息
 */
export class PetData {
    public ID: number = 0 // 宠物ID
    public Name: string = "" // 宠物名称
    public Dept: number = 0 // 宠物系别
    public Stage: number = 0 // 宠物阶数
    public BaseAttr: PetAttr = null // 基础属性(1级)
    public Growth: number = 0 // 成长值
    public Level: number = 1 // 等级
    public Exp: number = 0 // 经验值
    public Node: PetNode = null // 进化节点

    /**
     * 获取等级属性
     * @returns 等级属性
     */
    public GetLevelAttr(): PetAttr {
        // 构造属性
        let attr = new PetAttr()
        for (let k in this.BaseAttr) {
            attr[k] = Math.floor(this.BaseAttr[k] + this.Growth * (this.Level - 1) * LevelUpAttr[k])
        }

        return attr
    }
}

/**
 * 敌人信息
 */
export class EnemyData extends PetData {
    public Spoils: SpoilData[] = [] // 战利品列表
    public Gold: number = 0 // 击败所得金币
}

/**
 * 战利品信息
 */
export class SpoilData {
    public ID: number = 0 // 道具ID
    public Rate: number = 0 // 概率
}

/**
 * 宠物进化信息节点
 */
export class PetNode {
    public ID: number = 0 // 宠物ID
    public AID: number = 0 // A线路进化的目标宠物ID
    public BID: number = 0 // B线路进化的目标宠物ID
    public AProp: number = 0 // A线路进化道具ID
    public BProp: number = 0 // B线路进化道具ID
    public AChild: PetNode = null // A线路进化的目标子节点
    public BChild: PetNode = null // B线路进化的目标子节点
    public ALevel: number = 0 // A线路进化所需等级
    public BLevel: number = 0 // A线路进化所需等级
}

// === const ===

/**
 * 每点成长可获得的属性(升级)
 */
export const LevelUpAttr: PetAttr = {
    HP: 30,
    MP: 10,
    Atk: 5,
    Def: 3,
    Hit: 5,
    Dod: 4,
    Spd: 4
}

/**
 * 每点成长可获得的最大属性(转生)
 */
export const NirMaxAttr: PetAttr = {
    HP: 3000,
    MP: 1000,
    Atk: 500,
    Def: 300,
    Hit: 500,
    Dod: 400,
    Spd: 400
}

/**
 * 每点成长可获得的最小属性(转生)
 */
export const NirMinAttr: PetAttr = {
    HP: 300,
    MP: 100,
    Atk: 50,
    Def: 30,
    Hit: 50,
    Dod: 40,
    Spd: 40
}