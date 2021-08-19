import { IModel } from "../base/model"
import { ContainerType } from "../data/common_d"
import { GetMainMgr } from "../module/mainmgr"
import { GetMVMgr } from "../mv/mvmgr"
import { ContainerMsg, MapInfoMsg } from "../mv/mvmsg"
import { Json2Tmp } from "../util/json"

/**
 * 地图信息模型
 */
export class MapInfoModel implements IModel {
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
            case MapInfoMsg.MIM_SetMainReq:
                this.setMain(data)
                break
            // 进入战斗
            case MapInfoMsg.MIM_EnterFightReq:
                this.enterFight(data)
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
        GetMVMgr().ResData(mName, MapInfoMsg.MIM_SetMainRes, res)
    }

    /**
     * 进入战斗
     * @param id 地图ID
     */
    private enterFight(id: number) {
        // 进入结果
        let errEnter = GetMainMgr().EnterFight(id)

        // 应答进入结果
        GetMVMgr().ResData(mName, MapInfoMsg.MIM_EnterFightRes, errEnter)
    }
}

/**
 * 模块名
 */
const mName: string = "mapinfo"

/**
 * 初始化结构体
 */
GetMVMgr().AddStruct(mName, new MapInfoModel())