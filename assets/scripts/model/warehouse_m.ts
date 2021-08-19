import { IModel } from "../base/model"
import { ContainerType } from "../data/common_d"
import { GetMainMgr } from "../module/mainmgr"
import { GetMVMgr } from "../mv/mvmgr"
import { ContainerMsg, WarehouseMsg } from "../mv/mvmsg"
import { Json2Tmp } from "../util/json"

/**
 * 仓库模型
 */
export class WarehouseModel implements IModel {
    /**
     * 请求通知(视图请求)
     * @param msg 消息类型
     * @param data 请求数据
     */
    public ReqNotify(msg: string, data: any) {
        switch (msg) {
            // 背包列表
            case ContainerMsg.CM_PackReq:
                this.getPackList()
                break
            // 仓库列表
            case ContainerMsg.CM_WarehouseReq:
                this.getWarehouseList()
                break
            // 放入仓库
            case WarehouseMsg.WM_TakeInReq:
                this.takeInWarehouse(data)
                break
            // 取出仓库
            case WarehouseMsg.WM_TakeOutReq:
                this.takeOutWarehouse(data)
                break
        }
    }

    // === 私有方法处理 ===

    /**
     * 获取背包列表
     */
    private getPackList() {
        // 获取列表
        let list = GetMainMgr().GetContainerList(ContainerType.CT_Pack)

        // 背包空间
        let space = GetMainMgr().GetContainerSpace(ContainerType.CT_Pack)

        // 构造应答数据
        let res = {
            list: list,
            space: space
        }

        // 应答背包列表数据
        GetMVMgr().ResData(mName, ContainerMsg.CM_PackRes, res)
    }

    /**
     * 获取仓库列表
     */
    private getWarehouseList() {
        // 获取列表
        let list = GetMainMgr().GetContainerList(ContainerType.CT_Warehouse)

        // 仓库空间
        let space = GetMainMgr().GetContainerSpace(ContainerType.CT_Warehouse)

        // 构造应答数据
        let res = {
            list: list,
            space: space
        }

        // 应答仓库列表数据
        GetMVMgr().ResData(mName, ContainerMsg.CM_WarehouseRes, res)
    }

    /**
     * 放入仓库
     * @param data 请求数据
     */
    private takeInWarehouse(data: any) {
        // 请求模板
        let req = {
            id: 0,
            count: 0
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("takeInWarehouse:解析放入请求失败")
            return
        }

        // 放入结果
        let errIn = GetMainMgr().Pack2Warehouse(req.id, req.count)

        // 构造应答数据
        let res = {
            err: errIn,
            id: req.id,
            count: req.count
        }

        // 应答结果
        GetMVMgr().ResData(mName, WarehouseMsg.WM_TakeInRes, res)
    }

    /**
     * 取出仓库
     * @param data 请求数据
     */
    private takeOutWarehouse(data: any) {
        // 请求模板
        let req = {
            id: 0,
            count: 0
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("takeOutWarehouse:解析取出请求失败")
            return
        }

        // 取出结果
        let errOut = GetMainMgr().Warehouse2Pack(req.id, req.count)

        // 构造应答数据
        let res = {
            err: errOut,
            id: req.id,
            count: req.count
        }

        // 应答结果
        GetMVMgr().ResData(mName, WarehouseMsg.WM_TakeOutRes, res)
    }
}

/**
 * 模块名
 */
const mName: string = "warehouse"

/**
 * 初始化结构体
 */
GetMVMgr().AddStruct(mName, new WarehouseModel())