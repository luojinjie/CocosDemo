import { IModel } from "../base/model"
import { ContainerType } from "../data/common_d"
import { GetMainMgr } from "../module/mainmgr"
import { GetMVMgr } from "../mv/mvmgr"
import { BackpackMsg, ContainerMsg } from "../mv/mvmsg"
import { Json2Tmp } from "../util/json"

/**
 * 背包模型
 */
export class BackpackModel implements IModel {
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
            // 使用道具
            case BackpackMsg.PM_UseReq:
                this.useProp(data)
                break
            // 丢弃道具
            case BackpackMsg.PM_DropReq:
                this.dropProp(data)
                break
            // 放入仓库
            case BackpackMsg.PM_IntoReq:
                this.intoWarehouse(data)
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
     * 使用道具
     * @param data 请求数据
     */
    private useProp(data: any) {
        // 请求模板
        let req = {
            id: 0,
            count: 0,
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("useProp:解析使用请求失败")
            return
        }

        // 使用结果
        let errUse = GetMainMgr().UseProp(req.id, req.count)

        // 构造应答数据
        let res = {
            err: errUse,
            id: req.id,
            count: req.count
        }

        // 应答结果
        GetMVMgr().ResData(mName, BackpackMsg.PM_UseRes, res)
    }

    /**
     * 丢弃道具
     * @param data 请求数据
     */
    private dropProp(data: any) {
        // 请求模板
        let req = {
            id: 0,
            count: 0,
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("dropProp:解析丢弃请求失败")
            return
        }

        // 丢弃结果
        let errDrop = GetMainMgr().DropProp(req.id, req.count)

        // 构造应答数据
        let res = {
            err: errDrop,
            id: req.id,
            count: req.count
        }

        // 应答结果
        GetMVMgr().ResData(mName, BackpackMsg.PM_DropRes, res)
    }

    /**
     * 放入仓库
     * @param data 请求数据
     */
    private intoWarehouse(data: any) {
        // 请求模板
        let req = {
            id: 0,
            count: 0,
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("intoWarehouse:解析放入请求失败")
            return
        }

        // 放入结果
        let errInto = GetMainMgr().Pack2Warehouse(req.id, req.count)

        // 构造应答数据
        let res = {
            err: errInto,
            id: req.id,
            count: req.count
        }

        // 应答结果
        GetMVMgr().ResData(mName, BackpackMsg.PM_IntoRes, res)
    }
}

/**
 * 模块名
 */
const mName: string = "backpack"

/**
 * 初始化结构体
 */
GetMVMgr().AddStruct(mName, new BackpackModel())