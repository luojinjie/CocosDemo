import { IModel } from "../base/model"
import { ContainerType } from "../data/common_d"
import { GetMainMgr } from "../module/mainmgr"
import { GetMVMgr } from "../mv/mvmgr"
import { ContainerMsg, RanchMsg } from "../mv/mvmsg"
import { Json2Tmp } from "../util/json"

/**
 * 牧场模型
 */
export class RanchModel implements IModel {
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
            // 牧场列表
            case ContainerMsg.CM_RanchReq:
                this.getRanchList()
                break
            // 放入牧场
            case RanchMsg.RM_TakeInReq:
                this.takeInRanch(data)
                break
            // 取出牧场
            case RanchMsg.RM_TakeOutReq:
                this.takeOutRanch(data)
                break
            // 设置主战宠物
            case RanchMsg.RM_SetMainReq:
                this.setMain(data)
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
     * 获取牧场列表
     */
    private getRanchList() {
        // 获取列表
        let list = GetMainMgr().GetContainerList(ContainerType.CT_Ranch)

        // 仓库空间
        let space = GetMainMgr().GetContainerSpace(ContainerType.CT_Ranch)

        // 构造应答数据
        let res = {
            list: list,
            space: space
        }

        // 应答仓库列表数据
        GetMVMgr().ResData(mName, ContainerMsg.CM_RanchRes, res)
    }

    /**
     * 放入牧场
     * @param index 索引值
     */
    private takeInRanch(index: number) {
        // 放入结果
        let errIn = GetMainMgr().Carry2Ranch(index)

        // 构造应答数据
        let res = {
            err: errIn,
            index: index,
        }

        // 应答结果
        GetMVMgr().ResData(mName, RanchMsg.RM_TakeInRes, res)
    }

    /**
     * 取出牧场
     * @param index 索引值
     */
    private takeOutRanch(index: number) {
        // 取出结果
        let errOut = GetMainMgr().Ranch2Carry(index)

        // 构造应答数据
        let res = {
            err: errOut,
            index: index
        }

        // 应答结果
        GetMVMgr().ResData(mName, RanchMsg.RM_TakeOutRes, res)
    }

    /**
     * 设置主战宠物
     * @param index 索引值
     */
    private setMain(index: number) {
        // 设置结果
        let errSet = GetMainMgr().SetMainPet(index)

        // 构造应答数据
        let res = {
            err: errSet,
            index: index
        }

        // 应答设置结果
        GetMVMgr().ResData(mName, RanchMsg.RM_SetMainRes, res)
    }
}

/**
 * 模块名
 */
const mName: string = "ranch"

/**
 * 初始化结构体
 */
GetMVMgr().AddStruct(mName, new RanchModel())