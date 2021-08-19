import { GetPromptMgr } from "../prompt/promptmgr"
import { ContainerType } from "../../data/common_d"
import { NirMaxAttr, NirMinAttr, PetAttr, PetData, PetStage } from "../../data/pet_d"
import { AssistPetID, GetPetLib } from "../../lib/pet_l"
import { GetNextExp, UpdateLevel } from "../../util/exp"
import { Json2Tmp } from "../../util/json"

// N:依赖索引不太好用,有时间再考虑重构

/**
 * 用户宠物管理
 */
export class PetManager {
    private carryPets: PetData[] = [] // 携带宠物
    private ranchPets: PetData[] = [] // 牧场宠物
    private ranchMax: number = 20 // 当前牧场最大容量(默认20)
    private mainPet: PetData = null // 主战宠物
    private mainIndex: number = 0 // 主战索引

    /**
     * 初始化宠物
     * @param id 宠物ID
     * @returns 错误描述
     */
    public InitPet(id: number): string {
        // 宠物库中获取宠物
        let pet = GetPetLib().GetPet(id)
        if (!pet) {
            return "InitPet:无效的宠物"
        }

        // 放入携带
        this.carryPets.push(pet)

        // 初始宠物
        this.mainPet = pet
        this.mainIndex = 0

        return null
    }

    /**
     * 获取主战宠物
     * @returns 主战宠物
     */
    public GetMainPet(): PetData {
        return this.mainPet
    }

    /**
     * 获取主战索引
     * @returns 主战索引
     */
    public GetMainIndex(): number {
        return this.mainIndex
    }

    /**
     * 获取宠物
     * @param index 宠物索引
     * @returns 宠物信息
     */
    public GetPetByIndex(index: number): PetData {
        return this.carryPets[index]
    }

    /**
     * 获取宠物列表
     * @param type 容器类型
     * @returns 宠物列表
     */
    public GetPetList(type: number): PetData[] {
        if (type == ContainerType.CT_Ranch) {
            return this.ranchPets
        } else if (type == ContainerType.CT_Carry) {
            return this.carryPets
        }

        return null
    }

    /**
     * 增加宠物
     * @param pet 宠物信息
     * @returns 错误描述
     */
    public AddPet(pet: PetData): string {
        // 校验参数
        if (!pet) {
            return "AddPet:参数无效"
        }

        // 携带已满
        if (this.carryPets.length == carryLimit) {
            // 牧场已满
            if (this.ranchPets.length == this.ranchMax) {
                // 提示信息
                GetPromptMgr().ShowMsg("牧场已满！请提升牧场空间！")

                return "AddPet:空间不足"
            }

            // 放入牧场
            this.ranchPets.push(pet)

            // 排序列表
            this.doSort(this.ranchPets)
        } else {
            // 放入携带
            this.carryPets.push(pet)

            // 索引后移
            if (pet.Growth > this.mainPet.Growth) {
                this.mainIndex++
            }

            // 排序列表
            this.doSort(this.carryPets)
        }

        return null
    }

    /**
     * 丢弃宠物
     * @param pet 宠物信息
     * @returns 错误描述
     */
    public DropPet(type: number, index: number): string {
        let list: PetData[] = []

        if (type == ContainerType.CT_Ranch) {
            list = this.ranchPets
        } else {
            list = this.carryPets
        }

        // 宠物不存在
        if (!list[index]) {
            return "DropPet:宠物不存在"
        }

        // 移除
        list.splice(index, 1)

        // 索引前移
        if (type == ContainerType.CT_Carry && index <= this.mainIndex) {
            this.mainIndex--
        }

        return null
    }

    /**
     * 增加经验
     * @param exp 经验值
     * @returns 错误描述
     */
    public AddExp(exp: number): string {
        // 校验主宠
        if (!this.mainPet) {
            return "AddExp:缺失主战宠物"
        }

        // 满级不增加经验
        if (this.mainPet.Level >= maxLevel) {
            return null
        }

        // 增加经验
        this.mainPet.Exp += exp

        // 更新等级
        let next = GetNextExp(this.mainPet.Level)
        if (this.mainPet.Exp >= next) {
            let update = UpdateLevel(this.mainPet.Level, this.mainPet.Exp)
            this.mainPet.Level = update.level
            this.mainPet.Exp = update.exp
        }

        return null
    }

    /**
     * 设置主战宠物
     * @param index 宠物索引 
     * @returns 错误描述
     */
    public SetMainPet(index: number): string {
        // 校验宠物
        if (!this.carryPets[index]) {
            return "SetMainPet:宠物不存在"
        }

        this.mainPet = this.carryPets[index]
        this.mainIndex = index

        // 提示信息
        GetPromptMgr().ShowMsg("设置主战宠物成功！")

        return null
    }

    /**
     * 放入牧场(携带->牧场)
     * @param index 索引值
     * @returns 错误描述
     */
    public Carry2Ranch(index: number): string {
        // 校验宠物
        if (!this.carryPets[index]) {
            return "Carry2Ranch:宠物不存在"
        }

        // 主战宠物
        if (index == this.mainIndex) {
            // 提示信息
            GetPromptMgr().ShowMsg("主战宠物不能放入牧场！")

            return "Carry2Ranch:主战宠物不允许放入牧场"
        }

        // 牧场已满
        if (this.ranchPets.length == this.ranchMax) {
            // 提示信息
            GetPromptMgr().ShowMsg("牧场已满！请提升牧场空间！")

            return "Carry2Ranch:牧场空间不足"
        }

        // 索引前移
        if (index < this.mainIndex) {
            this.mainIndex--
        }

        // 转移宠物
        let pet = this.carryPets.splice(index, 1)[0]
        this.ranchPets.push(pet)

        // 排序列表
        this.doSort(this.carryPets)
        this.doSort(this.ranchPets)

        return null
    }

    /**
     * 取出宠物(牧场->携带)
     * @param index 索引值
     * @returns 错误描述
     */
    public Ranch2Carry(index: number): string {
        // 校验宠物
        if (!this.ranchPets[index]) {
            return "Ranch2Carry:宠物不存在"
        }

        // 携带已满
        if (this.carryPets.length == carryLimit) {
            // 提示信息
            GetPromptMgr().ShowMsg("携带已满！")

            return "Ranch2Carry:携带已满"
        }

        // 转移宠物
        let pet = this.ranchPets.splice(index, 1)[0]
        this.carryPets.push(pet)

        // 索引后移
        if (pet.Growth > this.mainPet.Growth) {
            this.mainIndex++
        }

        // 排序列表
        this.doSort(this.carryPets)
        this.doSort(this.ranchPets)

        return null
    }

    /**
     * 扩充容量
     * @param stage 扩充阶段
     * @returns 错误描述
     */
    public ExpandRanch(stage: number): string {
        // 校验参数
        if (stage > stageLimit.length) {
            return "ExpandRanch:扩充阶段无效"
        }

        // 当前容量阶段
        let curStage = this.getStage()

        // 容量未满,扩展阶段不对应
        if (curStage && curStage != stage) {
            // 提示信息
            GetPromptMgr().ShowMsg("请使用阶段符合的升级卷进行扩展！")

            return "ExpandCapacity:扩展阶段不符合当前容量所在阶段"
        }

        // 目标阶段容量上限
        let limit = stageLimit[stage - 1]

        // 校验
        if (this.ranchMax >= limit) {
            // 提示信息
            GetPromptMgr().ShowMsg("牧场已扩展到上限，请使用更高级的升级卷进行扩展！")

            return "ExpandRanch:当前牧场容量大于目标阶段上限"
        }

        this.ranchMax += stageUp

        return null
    }

    /**
     * 获取容器空间
     * @returns 容器空间
     */
    public GetContainerSpace(): number {
        return this.ranchMax
    }

    /**
     * 开启宠物卵所需容量检测
     * @returns 容量是否足够
     */
    public CanOpenEgg(): boolean {
        // 容量不足
        if (this.carryPets.length == carryLimit && this.ranchPets.length == this.ranchMax) {
            // 提示信息
            GetPromptMgr().ShowMsg("牧场已满！请提升牧场空间！")

            return false
        }

        return true
    }

    /**
     * 宠物进化
     * @param index 宠物索引
     * @param up 成长增加值
     * @param low 是否低级进化(线路A低级,线路B高级)
     * @returns 进化后宠物信息
     */
    public Evolve(index: number, up: number, low: boolean): PetData {
        // 校验宠物
        if (!this.carryPets[index]) {
            console.error("Evolve:宠物不存在")
            return null
        }

        // 所选宠物
        let pet = this.carryPets[index]
        // 进化后宠物ID
        let id = (low ? pet.Node.AID : pet.Node.BID) || pet.ID

        // 宠物库中获取进化后宠物
        let newPet = GetPetLib().GetPet(id)
        if (!newPet) {
            console.error("Evolve:无效的宠物")
            return null
        }

        // 校验进化等级
        let err = this.checkLevel(pet, low)
        if (err) {
            // 提示信息
            GetPromptMgr().ShowMsg("宠物等级不满足进化要求！")

            console.error("Evolve:进化失败|" + err)
            return null
        }

        // 增加成长
        pet.Growth += up

        // 变换宠物
        if (pet.ID != id) {
            this.updatePet(pet, newPet)
        }

        // 提示信息
        GetPromptMgr().ShowMsg("宠物进化成功！")

        return pet
    }

    /**
     * 宠物合成(1+1=1)
     * @param master 主宠索引
     * @param slave 副宠索引
     * @param defend 保护效果
     * @param success 成功效果
     * @param add 加成效果
     * @returns 合成后宠物信息
     */
    public Synthesis(master: number, slave: number, defend: boolean, success: number, add: number): { ok: boolean, pet: PetData } {
        // 校验宠物
        if (!this.carryPets[master] || !this.carryPets[slave]) {
            console.error("Synthesis:宠物不存在")
            return { ok: false, pet: null }
        }

        // 校验索引
        if (master == slave) {
            console.error("Synthesis:宠物索引相同")
            return { ok: false, pet: null }
        }

        // 主副宠物
        let mPet = this.carryPets[master]
        let sPet = this.carryPets[slave]

        // TODO:合成公式

        // 合成成功判断
        let random = Math.ceil(Math.random() * 100)
        let isSuc = random < (baseRate + baseRate * success / 100)
        if (!isSuc) {
            // 提示信息
            GetPromptMgr().ShowMsg("宠物合成失败！请再接再厉！")

            // 无保护
            if (!defend) {
                // 删除副宠
                this.DropPet(ContainerType.CT_Carry, slave)
            }

            return { ok: true, pet: null }
        }

        // 成长增长值
        let up = this.getSynGrowthUp(sPet.Growth, add)

        // 合成后宠物
        let newPet = null
        if (mPet.Stage == PetStage.PS_Ten && sPet.Stage == PetStage.PS_Ten) {
            // TODO:双10阶概率出神
        } else {
            newPet = GetPetLib().GetNextStage(mPet.ID) || mPet
        }

        // 删除副宠
        this.DropPet(ContainerType.CT_Carry, slave)

        // 更新合成属性
        this.updateSynAttr(mPet, sPet)

        // 重置经验等级
        mPet.Level = 1
        mPet.Exp = 0

        // 增加成长
        mPet.Growth += up

        // 变换宠物
        if (mPet.ID != newPet.ID) {
            this.updatePet(mPet, newPet)
        }

        // 更新主战宠物
        this.mainPet = this.carryPets[this.mainIndex]

        // 提示信息
        GetPromptMgr().ShowMsg("宠物合成成功！合成为 " + mPet.Name + " ！")

        return { ok: true, pet: mPet }
    }

    /**
     * 宠物转生(1+1+1=1)
     * @param master 主宠索引
     * @param slave 副宠索引
     * @param assist 协助索引
     * @param defend 保护效果
     * @param success 成功效果
     * @param add 加成效果
     * @returns 错误描述
     */
    public Nirvana(master: number, slave: number, assist: number, defend: boolean, success: number, add: number): { ok: boolean, pet: PetData } {
        // 校验宠物
        if (!this.carryPets[master] || !this.carryPets[slave] || !this.carryPets[assist]) {
            console.error("Nirvana:宠物不存在")
            return null
        }

        // 校验索引
        if (master == slave || slave == assist || master == assist) {
            console.error("Nirvana:宠物索引相同")
            return { ok: false, pet: null }
        }

        // 主副协助宠物
        let mPet = this.carryPets[master]
        let sPet = this.carryPets[slave]
        let aPet = this.carryPets[assist]

        // 校验涅槃兽
        if (aPet.ID != AssistPetID) {
            // 提示信息
            GetPromptMgr().ShowMsg("请选择正确的涅槃兽！")

            return { ok: false, pet: null }
        }

        // TODO:转生公式

        // 转生成功判断
        let random = Math.ceil(Math.random() * 100)
        let isSuc = random < (baseRate + baseRate * success / 100)
        if (!isSuc) {
            // 提示信息
            GetPromptMgr().ShowMsg("宠物转生失败！请再接再厉！")

            // 无保护
            if (!defend) {
                // 删除协助宠
                this.DropPet(ContainerType.CT_Carry, assist)
            }

            return { ok: true, pet: null }
        }

        // 成长增长值
        let up = this.getNirGrowthUp(mPet.Growth, sPet.Growth, add)

        // 删除副宠/协助宠
        // N:先删除索引值较大的,避免索引变化导致第二个删除不了
        this.DropPet(ContainerType.CT_Carry, slave > assist ? slave : assist)
        this.DropPet(ContainerType.CT_Carry, slave > assist ? assist : slave)

        // 增加成长
        mPet.Growth += up

        // 更新转生属性
        this.updateNirAttr(mPet, sPet)

        // 重置经验等级
        mPet.Level = 1
        mPet.Exp = 0

        // 变换宠物
        // if (mPet.ID != id) {
        //     this.updatePet(mPet, newPet)
        // }

        // 更新主战宠物
        this.mainPet = this.carryPets[this.mainIndex]

        // 提示信息
        GetPromptMgr().ShowMsg("宠物转生成功！")

        return { ok: true, pet: mPet }
    }

    // === 私有方法处理 ===

    /**
     * 校验进化等级
     * @param pet 宠物信息
     * @param low 是否低级进化(线路A低级,线路B高级)
     * @returns 错误描述
     */
    private checkLevel(pet: PetData, low: boolean): string {
        // 进化所需等级
        let level = low ? pet.Node.ALevel : pet.Node.BLevel

        // 校验等级
        if (pet.Level < level) {
            return "checkLevel:等级不足"
        }

        return null
    }

    /**
     * 变换宠物
     * @param op 旧宠物信息
     * @param np 新宠物信息
     */
    private updatePet(op: PetData, np: PetData) {
        // 更新信息
        op.ID = np.ID
        op.Name = np.Name
        op.Node = np.Node
        op.Dept = np.Dept
        op.Stage = np.Stage
    }

    /**
     * 排序列表
     * @param pets 宠物列表
     */
    private doSort(pets: PetData[]) {
        // 成长值从大到小
        pets.sort((a: PetData, b: PetData) => {
            return b.Growth - a.Growth
        })
    }

    /**
     * 获取合成成长增长值
     * @param growth 成长值
     * @param add 加成百分比
     * @returns 增加成长值
     */
    private getSynGrowthUp(growth: number, add: number): number {
        // 基础合成加成比例
        // N:成长值10以下80%,10以上60%
        let baseAdd: number = 80
        if (growth >= 10) {
            baseAdd = 60
        }

        // 真实加成比例
        let realAdd = baseAdd + baseAdd * add / 100

        return growth * realAdd / 100
    }

    /**
     * 获取转生成长增长值
     * @param mg 主宠成长值
     *  @param sg 副宠成长值
     * @param add 加成百分比
     * @returns 增加成长值
     */
    private getNirGrowthUp(mg: number, sg: number, add: number): number {
        // 基础转生加成比例
        let baseAdd: number = 0
        switch (true) {
            case mg < 100: // 成长值100以下
                baseAdd = 30
                break
            case (mg >= 100 && mg < 500): // 成长值100~500
                baseAdd = 20
                break
            case (mg >= 500 && mg < 1000): // 成长值500~1000
                baseAdd = 10
                break
            case mg >= 1000: // 成长值1000以上
                baseAdd = 5
                break
        }

        // 真实加成比例
        let realAdd = baseAdd + baseAdd * add / 100

        return sg * realAdd / 100
    }

    /**
     * 更新合成属性
     * @param master 主宠信息
     * @param slave 副宠信息
     */
    private updateSynAttr(master: PetData, slave: PetData) {
        // 抽成比例
        let mRate = this.getSynAttrUp(master.Level)
        let sRate = this.getSynAttrUp(slave.Level)

        // 抽成属性
        let mAttr = this.extractAttr(master.BaseAttr, mRate)
        let sAttr = this.extractAttr(slave.BaseAttr, sRate)

        // 属性叠加
        for (let k in mAttr) {
            mAttr[k] += sAttr[k]
        }

        // 更新属性
        master.BaseAttr = mAttr
    }

    /**
     * 获取合成属性抽成比例
     * @param level 宠物等级
     * @returns 抽成比例
     */
    private getSynAttrUp(level: number): number {
        let rate: number = 0
        switch (true) {
            case level >= 40 && level < 60: // 等级40~60
                rate = 30
                break
            case level >= 60 && level < 80: // 等级60~80
                rate = 50
                break
            case level >= 80 && level < 100: // 等级80~100
                rate = 80
                break
            case level >= 100: // 等级100以上
                rate = 100
                break
        }

        return rate
    }

    /**
     * 更新转生属性
     * @param master 主宠信息
     * @param slave 副宠信息
     */
    private updateNirAttr(master: PetData, slave: PetData) {
        // 抽成比例
        let mRate = this.getNirAttrUp(master.Level, true)
        let sRate = this.getNirAttrUp(slave.Level, false)

        // N:转生抽成比例需要-100

        // 抽成属性
        let mAttr = this.extractAttr(master.BaseAttr, mRate - 100)
        let sAttr = this.extractAttr(slave.BaseAttr, sRate - 100)

        // 属性叠加
        for (let k in mAttr) {
            mAttr[k] += sAttr[k]

            // 属性大于最大值
            if (mAttr[k] > master.Growth * NirMaxAttr[k]) {
                mAttr[k] = master.Growth * NirMaxAttr[k]
            }

            // 属性小于最小值
            if (mAttr[k] < master.Growth * NirMinAttr[k]) {
                mAttr[k] = master.Growth * NirMinAttr[k]
            }
        }

        // 更新属性
        master.BaseAttr = mAttr
    }

    /**
     * 获取转生属性抽成比例
     * @param level 宠物等级
     * @param master 是否主宠
     * @returns 抽成比例
     */
    private getNirAttrUp(level: number, master: boolean): number {
        let rate: number = 0
        switch (true) {
            case level >= 60 && level < 80: // 等级60~80
                rate = master ? 80 : 30
                break
            case level >= 80 && level < 90: // 等级80~90
                rate = master ? 90 : 40
                break
            case level >= 90 && level < 100: // 等级90~100
                rate = master ? 100 : 50
                break
            case level >= 100 && level < 110: // 等级100~110
                rate = master ? 110 : 60
                break
            case level >= 110 && level < 120: // 等级110~120
                rate = master ? 120 : 70
                break
            case level >= 120 && level < 130: // 等级120~130
                rate = master ? 130 : 80
                break
            case level >= 130: // 等级130
                rate = master ? 150 : 100
                break
        }

        return rate
    }

    /**
     * 抽取宠物属性
     * @param attr 基础属性
     * @param rate 抽成比例
     * @returns 
     */
    private extractAttr(attr: PetAttr, rate: number): PetAttr {
        // 构造宠物属性
        let pa = new PetAttr()

        // 解析宠物属性
        if (!Json2Tmp(pa, attr)) {
            console.error("extractAttr:解析宠物属性失败")
            return null
        }

        for (let k in pa) {
            // 增加属性
            pa[k] += pa[k] * rate / 100
        }

        return pa
    }

    /**
     * 获取当前容量所在阶段
     * @param 阶段
     */
    private getStage(): number {
        // 获取所在阶段
        for (let i = 0; i < stageLimit.length; i++) {
            if (this.ranchMax < stageLimit[i]) {
                // N:转换为1阶段开始
                return i + 1
            }
        }

        return null
    }
}

/**
 * 携带上限3
 */
const carryLimit: number = 3

/**
 * 每阶段容量上限
 */
const stageLimit = [40, 80, 100, 150]

/**
 * 每阶段容量提升数
 */
const stageUp = 1

/**
 * 最高等级
 */
const maxLevel = 100 // N:后续等级经验未收集,最高130

/**
 * 基础成功率(合成/转生)
 * 
 */
const baseRate = 20