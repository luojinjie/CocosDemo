import { IModel } from "../../base/model"
import { ContainerType } from "../../data/common_d"
import { GetMainMgr } from "../../module/mainmgr"
import { GetMVMgr } from "../../mv/mvmgr"
import { ContainerMsg, PetMsg } from "../../mv/mvmsg"

/**
 * 宠物资料模型
 */
export class PetModel implements IModel {
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
            // 设置主战宠物
            case PetMsg.PM_SetMainReq:
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
        GetMVMgr().ResData(mName, PetMsg.PM_SetMainRes, res)
    }
}

/**
 * 模块名
 */
const mName: string = "pet"

/**
 * 初始化结构体
 */
GetMVMgr().AddStruct(mName, new PetModel())