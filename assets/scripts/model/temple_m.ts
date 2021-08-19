import { IModel } from "../base/model"
import { ContainerType } from "../data/common_d"
import { GetMainMgr } from "../module/mainmgr"
import { GetMVMgr } from "../mv/mvmgr"
import { ContainerMsg, TempleMsg } from "../mv/mvmsg"
import { Json2Tmp } from "../util/json"

/**
 * 宠物神殿模型
 */
export class TempleModel implements IModel {
    /**
     * 请求通知(视图请求)
     * @param msg 消息类型
     * @param data 请求数据
     */
    public ReqNotify(msg: string, data: any) {
        switch (msg) {
            // 携带列表
            case ContainerMsg.CM_CarryReq:
                this.getCarryList()
                break
            // 道具列表
            case TempleMsg.TM_PropListReq:
                this.getPropList(data)
                break
            // 宠物进化
            case TempleMsg.TM_PetEvolveReq:
                this.doEvolve(data)
                break
            // 宠物合成
            case TempleMsg.TM_PetSynthesisReq:
                this.doSynthesis(data)
                break
            // 宠物转生
            case TempleMsg.TM_PetNirvanaReq:
                this.doNirvana(data)
                break
        }
    }

    // === 私有方法处理 ===

    /**
     * 获取携带列表
     */
    private getCarryList() {
        // 获取列表
        let list = GetMainMgr().GetContainerList(ContainerType.CT_Carry)

        // 主战索引
        let index = GetMainMgr().GetMainIndex()

        // 构造应答数据
        let res = {
            list: list,
            main: index
        }

        // 应答携带列表数据
        GetMVMgr().ResData(mName, ContainerMsg.CM_CarryRes, res)
    }

    /**
     * 获取道具列表
     * @param data 请求数据
     */
    private getPropList(data: any) {
        // 请求模板
        let req = {
            sType: 0,
            nType: 0
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("getPropList:解析道具列表请求失败")
            return
        }

        // 道具列表
        let sProps = GetMainMgr().GetPropsByType(req.sType)
        let nProps = GetMainMgr().GetPropsByType(req.nType)
        // 合并
        let props = Object.assign(sProps, nProps)

        // 应答道具列表
        GetMVMgr().ResData(mName, TempleMsg.TM_PropListRes, props)
    }

    /**
     * 宠物进化
     * @param data 请求数据
     */
    private doEvolve(data: any) {
        // 请求模板
        let req = {
            id: 0,
            index: 0,
            low: false
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("doEvolve:解析道具列表请求失败")
            return
        }

        // 进化后宠物信息
        let pet = GetMainMgr().EvolvePet(req.id, req.index, req.low)

        // 应答宠物信息
        GetMVMgr().ResData(mName, TempleMsg.TM_PetEvolveRes, pet)
    }

    /**
     * 宠物合成
     * @param data 请求数据
     */
    private doSynthesis(data: any) {
        // 请求模板
        let req = {
            master: 0,
            slave: 0,
            defend: 0,
            addition: 0
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("doSynthesis:解析合成信息请求失败")
            return
        }

        // 合成后宠物信息
        let pet = GetMainMgr().SynthesisPet(req.master, req.slave, req.defend, req.addition)

        // 应答宠物信息
        GetMVMgr().ResData(mName, TempleMsg.TM_PetSynthesisRes, pet)
    }

    /**
     * 宠物转生
     * @param data 请求数据
     */
    private doNirvana(data: any) {
        // 请求模板
        let req = {
            master: 0,
            slave: 0,
            assist: 0,
            defend: 0,
            addition: 0
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("doNirvana:解析转生信息请求失败")
            return
        }

        // 转生后宠物信息
        let pet = GetMainMgr().NirvanaPet(req.master, req.slave, req.assist, req.defend, req.addition)

        // 应答宠物信息
        GetMVMgr().ResData(mName, TempleMsg.TM_PetNirvanaRes, pet)
    }
}

/**
 * 模块名
 */
const mName: string = "temple"

/**
 * 初始化结构体
 */
GetMVMgr().AddStruct(mName, new TempleModel())