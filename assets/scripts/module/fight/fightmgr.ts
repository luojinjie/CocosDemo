import { GetPromptMgr } from "../prompt/promptmgr"
import { CatchData, FightBase, FightData, FightEnd, HurtData, OperFlag, OperType, TreatmentData } from "../../data/fight_d"
import { MapData, InstanceMap, MapType } from "../../data/map_d"
import { EnemyData, PetData } from "../../data/pet_d"

/**
 * 战斗管理
 */
export class FightManager {
    private pet: PetData = null // 宠物信息
    private map: MapData = null // 地图信息
    private enemy: EnemyData = null // 敌人信息
    private userBase: FightBase = null // 用户基础战斗信息
    private enemyBase: FightBase = null // 敌人基础战斗信息

    /**
     * 进入战斗,初始化信息
     * @param pet 宠物信息
     * @param map 地图信息
     */
    public EnterFight(pet: PetData, map: MapData): boolean {
        // 校验参数
        if (!pet) {
            console.error("EnterFight:参数无效")
            return false
        }

        // 记录信息
        this.pet = pet
        this.map = map

        return true
    }

    /**
     * 获取基础战斗信息
     * @returns 用户基础战斗信息
     * @returns 敌人基础战斗信息
     */
    public GetFightBase(): { user: FightBase, enemy: FightBase } {
        if (this.map.Type == MapType.MT_Normal) {
            // 随机一个敌人
            let index = Math.floor(Math.random() * this.map.Enemys.length)

            this.enemy = this.map.Enemys[index]
        } else if (this.map.Type == MapType.MT_Instance) {
            // 数据转换
            let map = <InstanceMap>this.map

            // 已通关
            if (map.Record == map.Enemys.length - 1) {
                // 提示信息
                GetPromptMgr().ShowMsg("副本已通关！")

                return { user: null, enemy: null }
            }

            this.enemy = this.map.Enemys[map.Record]
        }

        // 记录基础战斗信息
        this.userBase = this.buildBase(this.pet)
        this.enemyBase = this.buildBase(this.enemy)

        return { user: this.buildBase(this.pet), enemy: this.buildBase(this.enemy) }
    }

    /**
     * 使用技能
     * @param id 技能ID
     * @returns 战斗数据
     */
    public UseSkill(id: number): FightData {
        // TODO:技能库未实现,只能普通攻击

        // 战斗数据
        let fight = new FightData()

        // 比较速度
        if (this.pet.GetLevelAttr().Spd >= this.enemy.GetLevelAttr().Spd) {
            let hurt = this.buildHurt(true)
            fight.OperData.push(hurt)

            // 敌人未阵亡
            if (this.enemyBase.HP != 0) {
                let hurt = this.buildHurt(false)
                fight.OperData.push(hurt)
            }
        } else {
            let hurt = this.buildHurt(false)
            fight.OperData.push(hurt)

            // 用户未阵亡
            if (this.userBase.HP != 0) {
                let hurt = this.buildHurt(true)
                fight.OperData.push(hurt)
            }
        }

        // 基础数据
        fight.User = this.userBase
        fight.Enemy = this.enemyBase

        // 用户阵亡
        if (this.userBase.HP == 0) {
            fight.IsEnd = true
        }

        // 敌人阵亡
        if (this.enemyBase.HP == 0) {
            fight.IsEnd = true

            let end = new FightEnd()
            end.Exp = this.enemy.Exp
            end.Gold = this.enemy.Gold

            // 战利品独立计算是否获得
            for (let i = 0; i < this.enemy.Spoils.length; i++) {
                // 随机值
                let random = Math.ceil(Math.random() * 100)
                if (random < this.enemy.Spoils[i].Rate) {
                    end.Spoils.push(this.enemy.Spoils[i].ID)
                }
            }

            fight.EndData = end
        }

        return fight
    }

    /**
     * 使用药水
     * @param name 药水名
     * @param value 恢复量
     * @returns 战斗数据
     */
    public UseMedicine(name: string, value: number): FightData {
        // 战斗数据
        let fight = new FightData()

        // 比较速度
        if (this.pet.GetLevelAttr().Spd > this.enemy.GetLevelAttr().Spd) {
            let treat = this.buildTreatment(name, value)
            fight.OperData.push(treat)

            // 敌人攻击
            let hurt = this.buildHurt(false)
            fight.OperData.push(hurt)
        } else {
            let hurt = this.buildHurt(false)
            fight.OperData.push(hurt)

            // 用户未阵亡
            if (this.userBase.HP != 0) {
                let treat = this.buildTreatment(name, value)
                fight.OperData.push(treat)
            }
        }

        // 基础数据
        fight.User = this.userBase
        fight.Enemy = this.enemyBase

        // 用户阵亡
        if (this.userBase.HP == 0) {
            fight.IsEnd = true
        }

        return fight
    }

    /**
     * 捕捉宠物
     * @param success 是否成功
     * @returns 战斗数据
     */
    public CatchPet(success: boolean): FightData {
        // 战斗数据
        let fight = new FightData()

        // 捕捉信息
        let data = new CatchData()
        data.Flag = OperFlag.OF_User
        data.Type = OperType.OT_Catch
        data.Result = success
        fight.OperData.push(data)

        // 构建文本
        let text = ""
        if (success) {
            text = "恭喜你！捕捉 " + this.enemy.Name + " 成功！"
        } else {
            text = "捕捉失败，请再接再厉！"
        }

        // 提示信息
        GetPromptMgr().ShowMsg(text)

        // 捕捉失败,敌人攻击
        if (!success) {
            let hurt = this.buildHurt(false)
            fight.OperData.push(hurt)
        }

        // 基础数据
        fight.User = this.userBase
        fight.Enemy = this.enemyBase

        // 用户阵亡
        if (this.userBase.HP == 0) {
            fight.IsEnd = true
        }

        return fight
    }

    /**
     * 匹配捕捉宠物
     * @param id 捕捉宠物ID
     * @returns 是否匹配
     */
    public MatchCatch(id: number): boolean {
        return id == this.enemy.ID
    }

    // === 私有方法处理 ===

    /**
     * 构造战斗基础信息
     * @param data 宠物信息
     * @returns 战斗基础信息
     */
    private buildBase(data: PetData): FightBase {
        let base = new FightBase()
        base.ID = data.ID
        base.Name = data.Name
        base.Level = data.Level
        base.HP = data.GetLevelAttr().HP
        base.MP = data.GetLevelAttr().MP
        base.Exp = data.Exp

        return base
    }

    /**
     * 构造伤害数据
     * @param active 主动标识(true:用户,false:敌人)
     * @returns 伤害数据
     */
    private buildHurt(active: boolean): HurtData {
        // TODO:技能系数

        // 主动方/被动方信息
        let activeData: PetData = active ? this.pet : this.enemy
        let passiveData: PetData = active ? this.enemy : this.pet
        // let activeBase: FightBase = active ? this.userBase : this.enemyBase
        let passiveBase: FightBase = active ? this.enemyBase : this.userBase

        // 更新血量
        let base = activeData.GetLevelAttr().Atk - passiveData.GetLevelAttr().Def
        passiveBase.HP -= base
        if (passiveBase.HP < 0) {
            passiveBase.HP = 0
        }

        // 伤害信息
        let hurt = new HurtData()
        hurt.Flag = active ? OperFlag.OF_User : OperFlag.OF_Enemy
        hurt.Type = OperType.OT_Skill
        hurt.Name = "普通攻击"
        hurt.BaseHurt = base
        hurt.SuckBlood = 0
        hurt.DeepenHurt = 0

        return hurt
    }

    /**
     * 构造治疗信息
     * @param name 药水名
     * @param value 恢复量
     * @returns 治疗信息
     */
    private buildTreatment(name: string, value: number): TreatmentData {
        // 治疗信息
        let treat = new TreatmentData()
        treat.Flag = OperFlag.OF_User
        treat.Type = OperType.OT_Medicine
        treat.Name = name
        treat.Recovery = value

        // 更新血量
        this.userBase.HP += value
        if (this.userBase.HP > this.pet.GetLevelAttr().HP) {
            this.userBase.HP = this.pet.GetLevelAttr().HP
        }

        return treat
    }
}