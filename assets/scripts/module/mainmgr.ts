
import { CurrencyManager } from "./currency/currencymgr";
import { FightManager } from "./fight/fightmgr";
import { MapManager } from "./map/mapmgr";
import { PetManager } from "./pet/petmgr";
import { GetPromptMgr } from "./prompt/promptmgr";
import { PropManager } from "./prop/propmgr";
import { ContainerType, CurrencyType, GainType, SpecialType } from "../data/common_d";
import { FightBase, FightData } from "../data/fight_d";
import { MapData } from "../data/map_d";
import { PropDataEx, PropType } from "../data/prop_d";
import { PetData } from "../data/pet_d";
import { GetPetLib } from "../lib/pet_l";
import { Json2Tmp } from "../util/json";
import { DeepClone } from "../util/clone";
import { GetPropLib } from "../lib/prop_l";

/**
 * 主体管理(调度其他管理模块,减少模块间耦合,但是模块越多,代码量越膨胀)
 */
export class MainManager {
    private currencyMgr: CurrencyManager = null // 货币管理
    private propMgr: PropManager = null // 道具管理
    private petMgr: PetManager = null // 宠物管理
    private fightMgr: FightManager = null // 战斗管理
    private mapMgr: MapManager = null // 战斗管理

    /**
     * 构造函数
     */
    constructor() {
        // 构建各模块管理对象
        this.currencyMgr = new CurrencyManager()
        this.propMgr = new PropManager()
        this.petMgr = new PetManager()
        this.fightMgr = new FightManager()
        this.mapMgr = new MapManager()

        // TODO:获取缓存数据

        // 设置钩子函数
        this.propMgr.SetHook(this.usePropHook.bind(this))
    }

    // === 用户注册 start ===

    /**
     * 用户注册
     * @param name 用户名
     * @param id 宠物ID
     * @returns 注册结果
     */
    public Register(name: string, id: number): string {
        // TODO:记录用户名

        // 初始化宠物
        let errInit = this.petMgr.InitPet(id)
        if (errInit) {
            return "Register:用户注册失败|" + errInit
        }

        return null
    }

    // === 用户注册 End ===

    // === 背包界面相关操作 Start ===

    /**
     * 使用道具
     * @param id 道具ID
     * @param count 使用数量
     * @returns 错误描述
     */
    public UseProp(id: number, count: number): string {
        return this.propMgr.UseProp(id, count)
    }

    /**
     * 丢弃道具
     * @param id 道具ID
     * @param count 丢弃数量
     * @returns 错误描述
     */
    public DropProp(id: number, count: number): string {
        return this.propMgr.DropProp(id, count)
    }

    // === 背包界面相关操作 End ===

    // === 道具商店相关操作 Start ===

    /**
     * 购买道具
     * @param id 道具ID
     * @param count 购买数量
     * @param price 道具单价
     * @param type 货币类型
     * @returns 错误描述
     */
    public BuyProp(id: number, count: number, price: number, type: number): string {
        // 减少用户货币
        let errChange = this.currencyMgr.ChangeCurrency(type, -(count * price))
        if (errChange) {
            return "BuyProp:购买道具失败|" + errChange
        }

        // 增加用户道具
        let errAdd = this.propMgr.AddProp(id, count)
        if (errAdd) {
            // 退还用户货币
            this.currencyMgr.ChangeCurrency(type, count * price)

            return "BuyProp:购买道具失败|" + errAdd
        }

        // 提示信息
        GetPromptMgr().ShowMsg("购买成功！")

        return null
    }

    /**
     * 出售道具
     * @param id 道具ID
     * @param count 出售数量
     * @param price 道具单价
     * @returns 错误描述
     */
    public SellProp(id: number, count: number, price: number): string {
        // 消耗用户道具
        let errCons = this.propMgr.ConsumeProp(id, count)
        if (errCons) {
            return "SellProp:出售道具失败|" + errCons
        }

        // N:出售只能获得金币

        // 增加用户货币
        let errChange = this.currencyMgr.ChangeCurrency(CurrencyType.CT_Gold, count * price)
        if (errChange) {
            // 退还用户道具
            this.propMgr.AddProp(id, count)

            return "SellProp:出售道具失败|" + errChange
        }

        // 提示信息
        GetPromptMgr().ShowMsg("出售成功！")

        return null
    }

    // === 道具商店相关操作 End ===

    // === 仓库界面相关操作 Start ===

    /**
     * 放入道具(背包->仓库)
     * @param id 道具ID
     * @param count 道具数量
     * @returns 错误描述
     */
    public Pack2Warehouse(id: number, count: number): string {
        return this.propMgr.Pack2Warehouse(id, count)
    }

    /**
     * 取出道具(仓库->背包)
     * @param id 道具ID
     * @param count 道具数量
     * @returns 错误描述
     */
    public Warehouse2Pack(id: number, count: number): string {
        return this.propMgr.Warehouse2Pack(id, count)
    }

    // === 仓库界面相关操作 End ===

    // === 牧场界面相关操作 Start ===

    /**
     * 获取主战索引
     * @returns 主战索引
     */
    public GetMainIndex(): number {
        return this.petMgr.GetMainIndex()
    }

    /**
     * 放入牧场(携带->牧场)
     * @param index 索引值
     * @returns 错误描述
     */
    public Carry2Ranch(index: number): string {
        return this.petMgr.Carry2Ranch(index)
    }

    /**
     * 取出宠物(牧场->携带)
     * @param index 索引值
     * @returns 错误描述
     */
    public Ranch2Carry(index: number): string {
        return this.petMgr.Ranch2Carry(index)
    }

    // === 牧场界面相关操作 End ===

    // === 列表数据相关显示 Start ===

    /**
     * 获取容器列表
     * @param type 容器类型
     * @returns 容器列表
     */
    public GetContainerList(type: number): { [id: number]: PropDataEx } | PetData[] {
        switch (type) {
            case ContainerType.CT_Pack: // 背包
            case ContainerType.CT_Warehouse: // 仓库
                // N:本地引用类型数据,需要深拷贝
                // return this.petMgr.GetPetList(type)
                return DeepClone(this.propMgr.GetPropList(type))
            case ContainerType.CT_Ranch: // 牧场
            case ContainerType.CT_Carry: // 携带
                // N:本地引用类型数据,需要深拷贝
                // return this.petMgr.GetPetList(type)
                return DeepClone(this.petMgr.GetPetList(type))
        }

        return null
    }

    /**
     * 获取指定类型道具
     * @param type 道具类型
     * @returns 道具列表
     */
    public GetPropsByType(type: number): { [id: number]: PropDataEx } {
        // N:本地引用类型数据,需要深拷贝
        // return this.propMgr.GetPropsByType(type)
        return DeepClone(this.propMgr.GetPropsByType(type))
    }

    // === 列表数据相关显示 End ===

    // === 界面信息相关显示 Start ===

    /**
     * 获取用户货币
     * @param type 货币类型
     * @returns 用户货币
     */
    public GetCurrency(type: number): number {
        return this.currencyMgr.GetCurrency(type)
    }

    /**
     * 获取容器空间
     * @param type 容器类型
     * @returns 容器空间
     */
    public GetContainerSpace(type: number): number {
        switch (type) {
            case ContainerType.CT_Pack: // 背包
            case ContainerType.CT_Warehouse: // 仓库
                return this.propMgr.GetContainerSpace(type)
            case ContainerType.CT_Ranch: // 牧场
                return this.petMgr.GetContainerSpace()
        }

        return null
    }

    // === 界面信息相关显示 End ===

    // === 宠物神殿相关操作 Start ===

    /**
     * 宠物进化
     * @param id 宠物ID
     * @param index 宠物索引
     * @param low 是否低级进化(线路A低级,线路B高级)
     * @returns 进化后宠物信息
     */
    public EvolvePet(id: number, index: number, low: boolean): PetData {
        // 校验宠物索引
        let pet = this.petMgr.GetPetByIndex(index)
        if (!pet) {
            console.error("EvolvePet:宠物索引无效")
            return null
        }

        // 校验宠物ID
        if (pet.ID != id) {
            console.error("EvolvePet:宠物ID不匹配")
            return null
        }

        // 进化道具ID
        let pid = low ? pet.Node.AProp : pet.Node.BProp

        // 获取道具
        let prop = this.propMgr.GetProp(pid)
        if (!prop) {
            // 提示信息
            GetPromptMgr().ShowMsg("缺少进化道具！")

            return null
        }

        // 消耗用户道具
        let errCons = this.propMgr.ConsumeProp(pid, 1)
        if (errCons) {
            console.error("EvolvePet:消耗道具失败|" + errCons)
            return null
        }

        // 成长增加值
        let up = this.getGrowthUp(prop.Data.Script)

        // 宠物进化
        let evoPet = this.petMgr.Evolve(index, up, low)
        if (!evoPet) {
            // 退还用户道具
            this.propMgr.AddProp(pid, 1)

            return null
        }

        // N:本地引用类型数据,需要深拷贝
        // return evoPet
        return DeepClone(evoPet)
    }

    /**
     * 宠物合成
     * @param master 主宠索引
     * @param slave 副宠索引
     * @param did 保护类道具ID
     * @param aid 加成类道具ID
     * @returns 合成后宠物信息
     */
    public SynthesisPet(master: number, slave: number, did: number, aid: number): PetData {
        // 校验索引
        if (master == slave) {
            console.error("SynthesisPet:宠物索引无效")
            return null
        }

        // 效果信息
        let effect = {
            Defend: false,
            Success: 0,
            Add: 0
        }

        // N:保护道具可附带加成效果,加成道具不可附带保护效果

        // 获取保护道具
        let dProp = this.propMgr.GetProp(did)
        if (dProp) {
            // 消耗保护道具
            this.propMgr.ConsumeProp(did, 1)

            // 保护信息
            let defend = this.getEffect(dProp.Data.Script)

            // 记录效果
            effect.Defend = defend.defend
            effect.Success += defend.success
            effect.Add += defend.add
        }

        // 获取加成道具
        let aProp = this.propMgr.GetProp(aid)
        if (aProp) {
            // 消耗加成道具
            this.propMgr.ConsumeProp(aid, 1)

            // 加成信息
            let addition = this.getEffect(aProp.Data.Script)

            // 记录效果
            effect.Success += addition.success
            effect.Add += addition.add
        }

        // 宠物合成
        let resSyn = this.petMgr.Synthesis(master, slave, effect.Defend, effect.Success, effect.Add)
        if (!resSyn.ok) {
            if (dProp) {
                // 退还用户道具
                this.propMgr.AddProp(did, 1)
            }

            if (aProp) {
                // 退还用户道具
                this.propMgr.AddProp(aid, 1)
            }

            return null
        }

        // N:本地引用类型数据,需要深拷贝
        // return synPet
        return DeepClone(resSyn.pet)
    }

    /**
     * 宠物转生
     * @param master 主宠索引
     * @param slave 副宠索引
     * @param assist 协助索引
     * @param did 保护类道具ID
     * @param aid 加成类道具ID
     * @returns 转生后宠物信息
     */
    public NirvanaPet(master: number, slave: number, assist: number, did: number, aid: number): PetData {
        // 校验索引
        if (master == slave || slave == assist || master == assist) {
            console.error("NirvanaPet:宠物索引无效")
            return null
        }

        // 校验宠物
        let mPet = this.petMgr.GetPetByIndex(master)
        let sPet = this.petMgr.GetPetByIndex(slave)
        let aPet = this.petMgr.GetPetByIndex(assist)
        if (!mPet || !sPet || !aPet) {
            console.error("NirvanaPet:宠物不存在")
            return null
        }

        // 效果信息
        let effect = {
            Defend: false,
            Success: 0,
            Add: 0
        }

        // N:保护道具可附带加成效果,加成道具不可附带保护效果

        // 获取保护道具
        let dProp = this.propMgr.GetProp(did)
        if (dProp) {
            // 消耗保护道具
            this.propMgr.ConsumeProp(did, 1)

            // 保护信息
            let defend = this.getEffect(dProp.Data.Script)

            // 记录效果
            effect.Defend = defend.defend
            effect.Success += defend.success
            effect.Add += defend.add
        }

        // 获取加成道具
        let aProp = this.propMgr.GetProp(aid)
        if (aProp) {
            // 消耗加成道具
            this.propMgr.ConsumeProp(aid, 1)

            // 加成信息
            let addition = this.getEffect(aProp.Data.Script)

            // 记录效果
            effect.Success += addition.success
            effect.Add += addition.add
        }

        // 宠物转生
        let resNir = this.petMgr.Nirvana(master, slave, assist, effect.Defend, effect.Success, effect.Add)
        if (!resNir.ok) {
            if (dProp) {
                // 退还用户道具
                this.propMgr.AddProp(did, 1)
            }

            if (aProp) {
                // 退还用户道具
                this.propMgr.AddProp(aid, 1)
            }

            return null
        }

        // N:本地引用类型数据,需要深拷贝
        // return nirPet
        return DeepClone(resNir.pet)
    }

    // === 宠物神殿相关操作 End ===

    // === 扩充容器 Start ===

    /**
     * 扩充容量
     * @param type 容器类型
     * @param stage 扩充阶段
     * @returns 错误描述
     */
    public Expand(type: number, stage: number): string {
        switch (type) {
            case ContainerType.CT_Pack: // 背包
            case ContainerType.CT_Warehouse: // 仓库
                return this.propMgr.ExpandCapacity(type, stage)
            case ContainerType.CT_Ranch: // 牧场
                return this.petMgr.ExpandRanch(stage)
        }

        return null
    }

    // === 扩充容器 End ===

    // === 战斗管理 Start ===

    /**
     * 获取基础战斗信息
     * @returns 用户基础战斗信息
     * @returns 敌人基础战斗信息
     */
    public GetFightBase(): { user: FightBase, enemy: FightBase } {
        return this.fightMgr.GetFightBase()
    }

    /**
     * 使用技能
     * @param id 技能ID
     * @returns 战斗数据
     */
    public UseSkill(id: number): FightData {
        // 战斗数据
        let fight = this.fightMgr.UseSkill(id)

        // 战斗获胜
        if (fight.IsEnd && fight.EndData) {
            // 获得战利品
            this.propMgr.AddPropEx(fight.EndData.Spoils)
            // 获得金币
            this.currencyMgr.ChangeCurrency(CurrencyType.CT_Gold, fight.EndData.Gold)
            // 获得经验
            this.petMgr.AddExp(fight.EndData.Exp)
        }

        return fight
    }

    /**
     * 使用药水
     * @param id 道具ID
     * @returns 战斗数据
     */
    public UseMedicine(id: number): FightData {
        // 获取道具
        let prop = this.propMgr.GetProp(id)
        if (!prop) {
            console.error("UseMedicine:药水不存在")
            return null
        }

        // 药水模版
        let tmp = {
            Value: 0 // 恢复量
        }

        // 解析药水信息
        if (!Json2Tmp(tmp, prop.Data.Script)) {
            console.error("UseMedicine:解析药水信息失败")
            return null
        }

        return this.fightMgr.UseMedicine(prop.Data.Name, tmp.Value)
    }

    /**
     * 捕捉宠物
     * @param id 道具ID
     * @returns 战斗数据 
     */
    public CatchPet(id: number): FightData {
        // 获取道具
        let prop = this.propMgr.GetProp(id)
        if (!prop) {
            // 提示信息
            GetPromptMgr().ShowMsg("缺少精灵球！")

            return null
        }

        // 捕捉模版
        let tmp = {
            PID: 0, // 宠物ID
            Rate: 0 // 捕捉概率
        }

        // 解析精灵球信息
        if (!Json2Tmp(tmp, prop.Data.Script)) {
            console.error("CatchPet:解析精灵球信息失败")
            return null
        }

        // 校验当前战斗对象是否是捕捉目标
        if (!this.fightMgr.MatchCatch(tmp.PID)) {
            console.error("CatchPet:捕捉目标不匹配")
            return null
        }

        // 随机值
        let random = Math.ceil(Math.random() * 100)
        // 是否成功
        let success = random < tmp.Rate

        // 捕捉成功
        if (success) {
            let pet = GetPetLib().GetPet(tmp.PID)
            if (!pet) {
                console.error("CatchPet:宠物信息不存在")
                return null
            }

            // 追加成长值
            pet.Growth += this.appendGrowth(pet.Growth)

            // 增加宠物结果
            let errAdd = this.petMgr.AddPet(pet)
            if (errAdd) {
                console.error("CatchPet:增加宠物失败|" + errAdd)
                return null
            }
        }

        return this.fightMgr.CatchPet(success)
    }

    // === 战斗管理 End ===

    // === 地图管理 Start ===

    /**
     * 获取地图列表
     * @returns 地图列表
     */
    public GetMapList(): { [id: number]: MapData } {
        // N:本地引用类型数据,需要深拷贝
        // return this.mapMgr.GetMapList()
        return DeepClone(this.mapMgr.GetMapList())
    }

    /**
     * 解锁地图
     * @param id 地图ID
     * @returns 错误描述
     */
    public UnlockMap(id: number): string {
        // 截取ID
        let mid = 0xff & id

        // 钥匙道具ID(N:偷懒直接写死)
        let pid = 0x42000 + mid

        // 获取道具
        let prop = this.propMgr.GetProp(pid)
        if (!prop) {
            // 提示信息
            GetPromptMgr().ShowMsg("缺少钥匙！")

            return "UnlockMap:钥匙不存在"
        }

        // 消耗道具
        this.propMgr.ConsumeProp(pid, 1)

        // 解锁结果
        let errUnlock = this.mapMgr.UnlockMap(id)
        if (errUnlock) {
            // 退还用户道具
            this.propMgr.AddProp(pid, 1)

            return "UnlockMap:解锁地图失败|" + errUnlock
        }

        // 提示信息
        GetPromptMgr().ShowMsg("解锁成功！")

        return null
    }

    /**
     * 进入地图
     * @param id 地图ID
     * @returns 错误信息
     */
    public EnterMap(id: number): string {
        return this.mapMgr.EnterMap(id)
    }

    /**
     * 切换主战宠物
     * @param index 宠物索引
     * @returns 错误描述
     */
    public SetMainPet(index: number): string {
        return this.petMgr.SetMainPet(index)
    }

    /**
     * 进入战斗
     * @param id 地图ID
     * @returns 进入结果
     */
    public EnterFight(id: number): boolean {
        // 获取主战宠物
        let pet = this.petMgr.GetMainPet()
        if (!pet) {
            console.error("EnterFight:主战宠物异常")
            return false
        }

        // 获取地图信息
        let map = this.mapMgr.GetMap(id)
        if (!map) {
            console.error("EnterFight:地图不存在")
            return false
        }

        return this.fightMgr.EnterFight(pet, map)
    }

    // === 地图管理 End ===

    /**
     * 钩子函数处理
     * @param type 道具类型
     * @param json json字符串
     * @returns 处理结果
     */
    protected usePropHook(type: number, json: object): boolean {
        switch (type) {
            case PropType.PT_Giftbag: // 礼包
                return this.useGiftbag(json)
            case PropType.PT_Special: // 特殊
                return this.useSpecial(json)
            case PropType.PT_Petegg: // 宠物卵
                return this.usePetegg(json)
            case PropType.PT_Gain: // 增益
                return this.useGain(json)
            case PropType.PT_Scroll: // 卷轴
                return this.useScroll(json)
            case PropType.PT_Equip: // 装备
                return this.useEquip(json)
        }

        return false
    }

    /**
     * 使用礼包道具
     * @param json json数据
     * @returns 使用结果
     */
    private useGiftbag(json: object): boolean {
        // 校验背包剩余容量
        if (!this.propMgr.CanOpenGift()) {
            console.error("useGiftbag:背包容量不足")
            return false
        }

        // 礼包模版
        let tmp = {
            IDs: [0], // 内置道具列表
            Rate: [0] // 内置道具概率
        }

        // 解析礼包信息
        if (!Json2Tmp(tmp, json)) {
            console.error("useGiftbag:解析礼包信息失败")
            return false
        }

        // 随机值
        let random = Math.ceil(Math.random() * 100)

        // 当前概率范围
        let rate: number = 0
        // 符合概率的索引值
        let index: number = 0
        for (let i = 0; i < tmp.Rate.length; i++) {
            rate += tmp.Rate[i]
            if (random <= rate) {
                index = i
                break
            }
        }

        // 获取道具
        let prop = GetPropLib().GetProp(tmp.IDs[index])
        if (!prop) {
            console.error("useGiftbag:道具不存在")
            return null
        }

        // 增加用户道具
        let errAdd = this.propMgr.AddProp(tmp.IDs[index], 1)
        if (!errAdd) {
            // 提示信息
            GetPromptMgr().ShowMsg("开启礼包获得 " + prop.Name + " !")
        }

        return true
    }

    /**
     * 使用特殊道具
     * @param json json数据
     * @returns 使用结果
     */
    public useSpecial(json: object): boolean {
        // 特殊类型模版
        let tmp = {
            SType: 0, // 特殊类型
        }

        // 解析特殊类型
        if (!Json2Tmp(tmp, json)) {
            console.error("useSpecial:解析特殊类型失败")
            return false
        }

        // 扩充容量
        if (tmp.SType == SpecialType.ST_Container) {
            let cTmp = {
                CType: 0, // 容器类型
                Stage: 0, // 扩充阶段
            }

            // 解析扩充信息
            if (!Json2Tmp(cTmp, json)) {
                console.error("useSpecial:解析扩充信息失败")
                return false
            }

            console.log("容器类型: " + cTmp.CType)
            console.log("扩充阶段: " + cTmp.Stage)

            // 扩充结果
            let errExpand = this.Expand(cTmp.CType, cTmp.Stage)
            if (errExpand) {
                console.error("useSpecial:扩充容量失败|" + errExpand)
                return false
            }

            // 提示信息
            GetPromptMgr().ShowMsg("扩展成功！")

            return true
        }

        // 多倍经验模版
        let mTmp = {
            Multi: 0 // 倍数
        }

        // 解析倍数信息
        if (!Json2Tmp(mTmp, json)) {
            console.error("useSpecial:解析倍数信息失败")
            return false
        }

        console.log("倍数: " + mTmp.Multi)

        // TODO:设置倍数

        return true
    }

    /**
     * 使用宠物卵道具
     * @param json json数据
     * @returns 使用结果
     */
    private usePetegg(json: object): boolean {
        // 校验剩余容量
        if (!this.petMgr.CanOpenEgg()) {
            console.error("usePetegg:携带/牧场容量不足")
            return false
        }

        // 宠物ID模版
        let tmp = {
            ID: 0, // 宠物ID
        }

        // 解析宠物ID
        if (!Json2Tmp(tmp, json)) {
            console.error("usePetegg:解析宠物ID失败")
            return false
        }

        // 从宠物库获取宠物
        let pet = GetPetLib().GetPet(tmp.ID)
        if (!pet) {
            console.error("usePetegg:宠物信息不存在")
            return null
        }

        // 解析宠物信息
        if (!Json2Tmp(pet, json)) {
            console.error("usePetegg:解析宠物信息失败")
            return false
        }

        // 追加成长值
        pet.Growth += this.appendGrowth(pet.Growth)

        // 增加宠物结果
        let errAdd = this.petMgr.AddPet(pet)
        if (errAdd) {
            console.error("usePetegg:增加宠物失败|" + errAdd)
            return false
        }

        // 提示信息
        GetPromptMgr().ShowMsg("开启宠物卵获得 " + pet.Name + " ！")

        return true
    }

    /**
     * 使用增益道具
     * @param json json数据
     * @returns 使用结果
     */
    private useGain(json: object): boolean {
        // 增益类型模版
        let tmp = {
            GType: 0, // 增益类型
        }

        // 解析增益类型
        if (!Json2Tmp(tmp, json)) {
            console.error("useGain:解析增益类型失败")
            return false
        }

        // 增加威望
        if (tmp.GType == GainType.GT_Prestige) {
            // 威望模版
            let pTmp = {
                Prestige: 0, // 威望
            }

            // 解析增益信息
            if (!Json2Tmp(pTmp, json)) {
                console.error("useGain:解析增益信息失败")
                return false
            }

            // 增加用户威望
            let errChange = this.currencyMgr.ChangeCurrency(CurrencyType.CT_Prestige, pTmp.Prestige)
            if (errChange) {
                console.error("useGain:增加用户威望失败|" + errChange)
                return false
            }

            // 提示信息
            GetPromptMgr().ShowMsg("获得威望 " + pTmp.Prestige + " 点！")

            return true
        }

        // 经验模版
        let eTmp = {
            Exp: 0, // 经验
        }

        // 解析经验信息
        if (!Json2Tmp(eTmp, json)) {
            console.error("useGain:解析经验信息失败")
            return false
        }

        console.log("经验: " + eTmp.Exp)

        // 增加宠物经验
        let errAdd = this.petMgr.AddExp(eTmp.Exp)
        if (errAdd) {
            console.error("useGain:增加宠物经验失败|" + errAdd)
            return false
        }

        // 提示信息
        GetPromptMgr().ShowMsg("获得经验 " + eTmp.Exp + " ！")

        return true
    }

    /**
     * 使用卷轴道具
     * @param json json数据
     * @returns 使用结果
     */
    private useScroll(json: object): boolean {
        // TODO:

        return true
    }

    /**
     * 使用装备道具
     * @param json json数据
     * @returns 使用结果
     */
    private useEquip(json: object): boolean {
        // TODO:

        return true
    }

    // === === ===

    /**
     * 获取成长增加值
     * @param json json数据
     * @returns 增加值
     */
    private getGrowthUp(json: object): number {
        // 范围模版
        let tmp = {
            Min: 0,
            Max: 0
        }

        // 解析成长范围
        if (!Json2Tmp(tmp, json)) {
            console.error("getGrowthUp:解析成长范围失败")
            return null
        }

        // 校验范围
        if (tmp.Max == 0 || tmp.Min == 0) {
            console.error("getGrowthUp:成长范围无效")
            return null
        }

        // N:百分比
        return (tmp.Min + Math.floor(Math.random() * (tmp.Max - tmp.Min + 1))) / 100
    }

    /**
     * 获取道具效果
     * @param json json数据
     * @returns 保护效果
     * @returns 概率百分比
     * @returns 加成百分比
     */
    private getEffect(json: object): { defend: boolean, success: number, add: number } {
        // 道具效果模版
        let tmp = {
            Defend: false,
            Success: 0,
            Add: 0
        }

        // 解析道具效果
        if (!Json2Tmp(tmp, json)) {
            console.error("getEffect:解析道具效果失败")
            return { defend: false, success: 0, add: 0 }
        }

        // 校验信息
        if (!tmp.Defend && tmp.Add == 0) {
            console.error("getEffect:道具效果无效")
            return { defend: false, success: 0, add: 0 }
        }

        return { defend: tmp.Defend, success: tmp.Success, add: tmp.Add }
    }

    /**
     * 追加成长值
     * @param growth 初始成长值
     * @returns 追加成长值
     */
    private appendGrowth(growth: number): number {
        // 满成长不追加
        if (growth == 60) {
            return 0
        }

        // N:暂时固定取30%进行随机
        return Math.random() * growth * 0.3
    }

    /**
     * 测试接口
     */
    public Test() {
        // 使用礼包道具
        this.useGiftbag(json1)

        // 使用特殊道具
        this.useSpecial(json2)
        this.useSpecial(json3)

        // 使用宠物卵道具
        this.usePetegg(json4)

        // 使用增益道具
        this.useGain(json5)
        this.useGain(json6)
    }
}

/**
 * 获取管理对象
 * @returns 管理对象
 */
export function GetMainMgr(): MainManager {
    return mainMgr
}

/**
 * 管理对象
 */
let mainMgr: MainManager = new MainManager()

// === === ===

// === 测试模版 ===

// N:JSON数据格式,保留

// 礼包
let json1 = { IDs: [1, 6, 9, 15], Rate: [5, 15, 30, 50] }
// 特殊(扩容)
let json2 = { SType: 1, CType: 1, Stage: 1 }
// 特殊(倍数)
let json3 = { SType: 2, Multi: 2 }
// 宠物卵
let json4 = { ID: 1, Name: "小神龙琅琊", Dept: 6, Stage: 11, BaseAttr: { HP: 12000, MP: 12000, Atk: 12000, Def: 12000, Hit: 12000, Dod: 12000, Spd: 12000, }, Growth: 60 }
// 增益(威望)
let json5 = { GType: 1, Prestige: 100 }
// 增益(经验)
let json6 = { GType: 2, Exp: 2000000 }

// === === ===

// 药水
let json7 = { Value: 100 }
// 捕捉
let json8 = { PID: 0x10001, Rate: 30 }
// 进化
let json9 = { Min: 10, Max: 30 }
// 合成/转生
let json10 = { Defend: false, Success: 10, Add: 30 }

// mainMgr.Test()