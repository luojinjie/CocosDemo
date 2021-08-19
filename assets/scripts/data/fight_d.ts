// === enum ===

/**
 * 操作类型
 */
export enum OperType {
    OT_Skill = 1, // 技能
    OT_Medicine = 2, // 药水
    OT_Catch = 3, // 捕捉
}

/**
 * 操作标识
 */
export enum OperFlag {
    OF_User = 1, // 用户
    OF_Enemy = 2 // 敌人
}

// === class ===

/**
 * 基础战斗信息(用于UI显示)
 */
export class FightBase {
    public ID: number = 0 // ID
    public Name: string = "" // 名称
    public Level: number = 0 // 等级
    public HP: number = 0 // 生命值
    public MP: number = 0 // 魔法值
    public Exp: number = 0 // 经验值
}

/**
 * 操作数据
 */
export class OperData {
    public Flag: number = 0 // 操作标识
    public Type: number = 0 // 操作类型
}

/**
 * 战斗数据
 */
export class FightData {
    public User: FightBase = null // 用户战斗信息
    public Enemy: FightBase = null // 敌人战斗信息
    public OperData: OperData[] = [] // 操作数据
    public IsEnd: boolean = false // 是否结束
    public EndData: FightEnd = null // 战斗结束数据
}

/**
 * 伤害信息
 */
export class HurtData extends OperData {
    public Name: string = "" // 技能名
    public BaseHurt: number = 0 // 基础伤害
    public SuckBlood: number = 0 // 吸血值
    public DeepenHurt: number = 0 // 伤害加深
}

/**
 * 治疗信息
 */
export class TreatmentData extends OperData {
    public Name: string = "" // 药水名/技能名
    public Recovery: number = 0 // 恢复量
}

/**
 * 捕捉信息
 */
export class CatchData extends OperData {
    public Result: boolean = false // 捕捉结果
}

/**
 * 战斗结束
 */
export class FightEnd {
    // public IsWin: boolean = false // 是否胜利
    public Exp: number = 0 // 所得经验
    public Spoils: number[] = [] // 战利品列表
    public Gold: number = 0 // 所得金币
}