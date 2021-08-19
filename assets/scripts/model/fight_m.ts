import { IModel } from "../base/model"
import { OperType } from "../data/fight_d"
import { GetMainMgr } from "../module/mainmgr"
import { GetMVMgr } from "../mv/mvmgr"
import { FightMsg } from "../mv/mvmsg"
import { Json2Tmp } from "../util/json"

/**
 * 战斗模型
 */
export class FightModel implements IModel {
    /**
     * 请求通知(视图请求)
     * @param msg 消息类型
     * @param data 请求数据
     */
    public ReqNotify(msg: string, data: any) {
        switch (msg) {
            // 获取基础战斗信息
            case FightMsg.FM_GetFightBaseReq:
                this.getFightBase()
                break
            // 用户操作
            case FightMsg.FM_UserOperReq:
                this.doUserOper(data)
                break
            // 道具列表
            case FightMsg.FM_PropListReq:
                this.getPropList(data)
                break
        }
    }

    // === 私有方法处理 ===

    /**
     * 获取基础战斗信息
     */
    private getFightBase() {
        // 基础信息
        let base = GetMainMgr().GetFightBase()

        // 应答基础战斗信息
        GetMVMgr().ResData(mName, FightMsg.FM_GetFightBaseRes, base)
    }

    /**
     * 用户操作
     * @param data 请求数据
     */
    private doUserOper(data: any) {
        // 请求模板
        let req = {
            type: 0
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("doUserOper:解析用户操作失败")
            return
        }

        switch (req.type) {
            // 技能
            case OperType.OT_Skill:
                this.useSkill(data)
                break
            // 药水
            case OperType.OT_Medicine:
                this.useMedicine(data)
                break
            // 捕捉
            case OperType.OT_Catch:
                this.doCatch(data)
                break
            default:
                console.error("doUserOper:用户操作无效")
                break
        }
    }

    /**
     * 获取道具列表
     * @param type 道具类型
     */
    private getPropList(type: number) {

        // 精灵球列表
        let props = GetMainMgr().GetPropsByType(type)

        // 应答道具列表
        GetMVMgr().ResData(mName, FightMsg.FM_PropListRes, props)
    }

    /**
     * 使用技能
     * @param data 请求数据
     */
    private useSkill(data: any) {
        // 请求模板
        let req = {
            skill: 0
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("useSkill:解析技能操作失败")
            return
        }

        // 战斗数据
        let fight = GetMainMgr().UseSkill(req.skill)

        // 应答操作结果
        GetMVMgr().ResData(mName, FightMsg.FM_UserOperRes, fight)
    }

    /**
     * 使用药水
     * @param data 请求数据
     */
    private useMedicine(data: any) {
        // 请求模板
        let req = {
            prop: 0
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("useMedicine:解析药水操作失败")
            return
        }

        // 战斗数据
        let fight = GetMainMgr().UseMedicine(req.prop)

        // 应答操作结果
        GetMVMgr().ResData(mName, FightMsg.FM_UserOperRes, fight)
    }

    /**
    * 执行捕捉
    * @param data 请求数据
    */
    private doCatch(data: any) {
        // 请求模板
        let req = {
            prop: 0
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("doCatch:解析捕捉操作失败")
            return
        }

        // 战斗数据
        let fight = GetMainMgr().CatchPet(req.prop)

        // 应答操作结果
        GetMVMgr().ResData(mName, FightMsg.FM_UserOperRes, fight)
    }

    /**
    * 执行逃跑
    * @param data 请求数据
    */
    private doEscape() { }
}

/**
 * 模块名
 */
const mName: string = "fight"

/**
 * 初始化结构体
 */
GetMVMgr().AddStruct(mName, new FightModel())