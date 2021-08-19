import { GetPromptMgr } from "../prompt/promptmgr"
import { ContainerType } from "../../data/common_d"
import { PropDataEx } from "../../data/prop_d"
import { GetPropLib } from "../../lib/prop_l"

/**
 * 用户道具管理
 */
export class PropManager {
    private packProps: { [id: number]: PropDataEx } = {} // 背包道具
    private warehouseProps: { [id: number]: PropDataEx } = {}  // 仓库道具
    private packMax: number = 30 // 当前背包最大容量(默认30)
    private warehouseMax: number = 30 // 当前仓库最大容量(默认30)
    private hook: (type: number, json: object) => boolean = null // 钩子函数

    /**
     * 设置钩子函数
     * @param cb 钩子函数
     */
    public SetHook(cb: (type: number, json: object) => boolean) {
        this.hook = cb
    }

    /**
     * 获取指定道具
     * @param id 道具ID
     * @returns 道具信息
     */
    public GetProp(id: number): PropDataEx {
        return this.packProps[id]
    }

    /**
     * 获取道具列表
     * @param type 容器类型
     * @returns 道具列表
     */
    public GetPropList(type: number): { [id: number]: PropDataEx } {
        if (type == ContainerType.CT_Pack) {
            return this.packProps
        } else if (type == ContainerType.CT_Warehouse) {
            return this.warehouseProps
        }

        return null
    }

    /**
     * 获取指定类型道具
     * @param type 道具类型
     * @returns 道具列表
     */
    public GetPropsByType(type: number): { [id: number]: PropDataEx } {
        let props: { [id: number]: PropDataEx } = {}
        for (let k in this.packProps) {
            if (this.packProps[k].Data.Type == type) {
                props[k] = this.packProps[k]
            }
        }

        return props
    }

    /**
     * 增加道具
     * @param id 道具ID
     * @param count 道具数量
     * @returns 错误描述
     */
    public AddProp(id: number, count: number): string {
        // 从道具库中获取道具
        let prop = GetPropLib().GetProp(id)
        if (!prop) {
            return "AddProp:无效的道具"
        }

        // 背包存在道具
        if (this.packProps[id]) {
            this.packProps[id].Count += count
            return null
        }

        // 校验容量
        if (Object.keys(this.packProps).length >= this.packMax) {
            // 提示信息
            GetPromptMgr().ShowMsg("背包已满！请提升背包空间！")

            return "AddProp:背包已满"
        }

        // 构造道具信息
        let propEx = new PropDataEx()
        propEx.ID = id
        propEx.Data = prop
        propEx.Count = count

        this.packProps[id] = propEx

        return null
    }

    /**
     * 增加道具
     * @param ids 道具ID集合
     * @returns 错误描述
     */
    public AddPropEx(ids: number[]): string {
        // 错误信息集合
        let errs = []
        for (let i = 0; i < ids.length; i++) {
            let err = this.AddProp(ids[i], 1)
            if (err) {
                errs.push(err)
            }
        }

        // 无错误信息
        if (errs.length == 0) {
            return null
        }

        // 格式化错误信息
        let errStr = errs[0]
        for (let i = 1; i < errs.length; i++) {
            errStr += "|" + errs[i]
        }

        return errStr
    }

    /**
     * 丢弃道具
     * @param id 道具ID
     * @param count 道具数量
     * @returns 错误描述
     */
    public DropProp(id: number, count: number): string {
        // 检查道具
        let errCheck = this.CheckProp(id, count, true)
        if (errCheck) {
            return "DropProp:丢弃道具失败|" + errCheck
        }

        // 减少背包道具
        this.reduce(id, count, ContainerType.CT_Pack)

        return null
    }

    /**
     * 使用道具
     * @param id 道具ID
     * @param count 消耗数量
     * @returns 错误描述
     */
    public UseProp(id: number, count: number): string {
        // 钩子函数不存在
        if (!this.hook) {
            return "UseProp:钩子函数不存在"
        }

        // 检查道具
        let errCheck = this.CheckProp(id, count, true)
        if (errCheck) {
            return "UseProp:使用道具失败|" + errCheck
        }

        // 道具不可使用
        if (!this.packProps[id].Data.Useable) {
            // 提示信息
            GetPromptMgr().ShowMsg("道具不可使用！")

            return "UseProp:道具不可使用！"
        }

        // 道具信息
        let prop = this.packProps[id].Data

        // 钩子函数处理
        if (!this.hook(prop.Type, prop.Script)) {
            return "UseProp:钩子函数处理失败"
        }

        // TODO:暂不支持批量使用,批量使用时可能会有背包满、牧场满等情况,减少道具数量会不正确
        // 考虑是批量使用前校验剩余空间是否足够?或者记录成功数量,中途失败停止,扣除成功的数量

        // 减少背包道具
        this.reduce(id, count, ContainerType.CT_Pack)

        return null
    }

    /**
     * 消耗道具
     * @param id 道具ID
     * @param count 消耗数量
     * @returns 错误描述
     */
    public ConsumeProp(id: number, count: number): string {
        // 检查道具
        let errCheck = this.CheckProp(id, count, true)
        if (errCheck) {
            return "ConsumeProp:消耗道具失败|" + errCheck
        }

        // 减少背包道具
        this.reduce(id, count, ContainerType.CT_Pack)

        return null
    }

    /**
     * 检查道具
     * @param id 道具ID
     * @param count 消耗数量
     * @returns 检查结果
     */
    public CheckProp(id: number, count: number, pack: boolean): string {
        if (pack) {
            // 背包道具不存在
            if (!this.packProps[id]) {
                // 提示信息
                GetPromptMgr().ShowMsg("道具不在背包内")

                return "CheckProp:道具不在背包内"
            }

            // 背包道具数量不足
            if (this.packProps[id].Count < count) {
                // 提示信息
                GetPromptMgr().ShowMsg("背包道具数量不足")

                return "CheckProp:背包道具数量不足"
            }

            return null
        }

        // 仓库道具不存在
        if (!this.warehouseProps[id]) {
            // 提示信息
            GetPromptMgr().ShowMsg("道具不在仓库内")

            return "CheckProp:道具不在仓库内"
        }

        // 仓库道具数量不足
        if (this.warehouseProps[id].Count < count) {
            // 提示信息
            GetPromptMgr().ShowMsg("仓库道具数量不足")

            return "CheckProp:仓库道具数量不足"
        }

        return null
    }

    /**
     * 放入道具(背包->仓库)
     * @param id 道具ID
     * @param count 道具数量
     * @returns 错误描述
     */
    public Pack2Warehouse(id: number, count: number): string {
        // 从道具库中获取道具
        let prop = GetPropLib().GetProp(id)
        if (!prop) {
            return "Pack2Warehouse:无效的道具"
        }

        // 检查道具
        let errCheck = this.CheckProp(id, count, true)
        if (errCheck) {
            return "Pack2Warehouse:放入道具失败|" + errCheck
        }

        // 仓库存在道具
        if (this.warehouseProps[id]) {
            this.warehouseProps[id].Count += count
        } else {
            // 校验容量
            if (Object.keys(this.warehouseProps).length >= this.warehouseMax) {
                // 提示信息
                GetPromptMgr().ShowMsg("仓库已满")

                return "Pack2Warehouse:仓库已满"
            }

            // 构造道具信息
            let propEx = new PropDataEx()
            propEx.ID = id
            propEx.Data = prop
            propEx.Count = count

            this.warehouseProps[id] = propEx
        }

        // 减少背包道具
        this.reduce(id, count, ContainerType.CT_Pack)

        return null
    }

    /**
     * 取出道具(仓库->背包)
     * @param id 道具ID
     * @param count 道具数量
     * @returns 错误描述
     */
    public Warehouse2Pack(id: number, count: number): string {
        // 从道具库中获取道具
        let prop = GetPropLib().GetProp(id)
        if (!prop) {
            return "Warehouse2Pack:无效的道具"
        }

        // 检查道具
        let errCheck = this.CheckProp(id, count, false)
        if (errCheck) {
            return "Warehouse2Pack:取出道具失败|" + errCheck
        }

        // 背包存在道具
        if (this.packProps[id]) {
            this.packProps[id].Count += count
        } else {
            // 校验容量
            if (Object.keys(this.packProps).length >= this.packMax) {
                // 提示信息
                GetPromptMgr().ShowMsg("背包已满")

                return "Warehouse2Pack:背包已满"
            }

            // 构造道具信息
            let propEx = new PropDataEx()
            propEx.ID = id
            propEx.Data = prop
            propEx.Count = count

            this.packProps[id] = propEx
        }

        // 减少仓库道具
        this.reduce(id, count, ContainerType.CT_Warehouse)

        return null
    }

    /**
     * 扩充容量
     * @param type 容器类型
     * @param stage 扩充阶段
     * @returns 错误描述
     */
    public ExpandCapacity(type: number, stage: number): string {
        // 校验参数
        if (type < ContainerType.CT_Pack || type > ContainerType.CT_Warehouse) {
            return "ExpandCapacity:容器类型无效"
        }

        // 校验参数
        if (stage > stageLimit.length) {
            return "ExpandCapacity:扩充阶段无效"
        }

        // 当前容量阶段
        let curStage = this.getStage(type)

        // 容量未满,扩展阶段不对应
        if (curStage && curStage != stage) {
            // 提示信息
            GetPromptMgr().ShowMsg("请使用阶段符合的升级卷进行扩展！")

            return "ExpandCapacity:扩展阶段不符合当前容量所在阶段"
        }

        // 目标阶段容量上限
        let limit = stageLimit[stage - 1]
        // 目标阶段容量提升数量
        let up = stageUp[stage - 1]

        if (type == ContainerType.CT_Pack) {
            return this.expandPack(limit, up)
        }

        return this.expandWarehouse(limit, up)
    }

    /**
     * 获取容器空间
     * @param type 容器类型
     * @returns 容器空间
     */
    public GetContainerSpace(type: number): number {
        // 校验参数
        if (type < ContainerType.CT_Pack || type > ContainerType.CT_Warehouse) {
            console.error("GetContainerSpace:容器类型无效")
            return null
        }

        if (type == ContainerType.CT_Pack) {
            return this.packMax
        }

        return this.warehouseMax
    }

    /**
     * 开启礼包所需容量检测
     * @returns 容量是否足够
     */
    public CanOpenGift(): boolean {
        // 容量不足
        if (Object.keys(this.packProps).length + openGiftLimit > this.packMax) {
            // 提示信息
            GetPromptMgr().ShowMsg("背包已满！请提升背包空间！")

            return false
        }

        return true
    }

    // === 私有方法处理 ===

    /**
     * 减少道具
     * @param id 道具ID
     * @param count 消耗数量
     * @param type 容器类型
     */
    private reduce(id: number, count: number, type: number) {
        if (type == ContainerType.CT_Pack) {
            // 减少背包道具
            this.packProps[id].Count -= count

            // 移除道具信息
            if (this.packProps[id].Count == 0) {
                delete this.packProps[id]
            }

            return
        }

        // 减少仓库道具
        this.warehouseProps[id].Count -= count

        // 移除道具信息
        if (this.warehouseProps[id].Count == 0) {
            delete this.warehouseProps[id]
        }
    }

    /**
     * 扩充背包容量
     * @param limit 容量上限
     * @param up 提升数量
     * @returns 错误描述
     */
    private expandPack(limit: number, up: number): string {
        // 校验
        if (this.packMax >= limit) {
            // 提示信息
            GetPromptMgr().ShowMsg("背包已扩展到上限，请使用更高级的升级卷进行扩展！")

            return "expandPack:当前背包容量大于目标阶段上限"
        }

        this.packMax += up

        return null
    }

    /**
     * 扩充仓库容量
     * @param limit 容量上限
     * @param up 提升数量
     * @returns 错误描述
     */
    private expandWarehouse(limit: number, up: number): string {
        // 校验
        if (this.warehouseMax >= limit) {
            // 提示信息
            GetPromptMgr().ShowMsg("仓库已扩展到上限，请使用更高级的升级卷进行扩展！")

            return "expandWarehouse:当前仓库容量大于目标阶段上限"
        }

        this.warehouseMax += up

        return null
    }

    /**
     * 获取当前容量所在阶段
     * @param type 容器类型
     * @param 阶段
     */
    private getStage(type: number): number {
        // 当前容量
        let count = type == ContainerType.CT_Pack ? this.packMax : this.warehouseMax

        // 获取所在阶段
        for (let i = 0; i < stageLimit.length; i++) {
            if (count < stageLimit[i]) {
                // N:转换为1阶段开始
                return i + 1
            }
        }

        return null
    }
}

/**
 * 开启礼包所需最小容量限制
 */
const openGiftLimit: number = 3

/**
 * 每阶段容量上限(背包与仓库一致)
 */
const stageLimit = [96, 150, 200, 300]

/**
 * 每阶段容量提升数量(背包与仓库一致)
 */
const stageUp = [6, 6, 5, 5]