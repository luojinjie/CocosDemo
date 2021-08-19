import { IModel } from "../../base/model"
import { GetMainMgr } from "../../module/mainmgr"
import { GetMVMgr } from "../../mv/mvmgr"
import { ExploreMsg } from "../../mv/mvmsg"

/**
 * 野外探险模型
 */
export class ExploreModel implements IModel {
    /**
     * 请求通知(视图请求)
     * @param msg 消息类型
     * @param data 请求数据
     */
    public ReqNotify(msg: string, data: any) {
        switch (msg) {
            // 地图列表
            case ExploreMsg.EM_MapListReq:
                this.getMapList()
                break
            // 解锁地图
            case ExploreMsg.EM_UnlockMapReq:
                this.doUnlockMap(data)
                break
            // 进入地图
            case ExploreMsg.EM_EnterMapReq:
                this.doEnterMap(data)
                break
        }
    }

    // === 私有方法处理 ===

    /**
     * 获取地图列表
     */
    private getMapList() {
        // 获取地图列表
        let list = GetMainMgr().GetMapList()

        // 应答背包列表数据
        GetMVMgr().ResData(mName, ExploreMsg.EM_MapListRes, list)
    }

    /**
     * 解锁地图
     * @param id 地图ID
     */
    private doUnlockMap(id: number) {
        // 解锁结果
        let errUnlock = GetMainMgr().UnlockMap(id)

        // 构造应答数据
        let res = {
            err: errUnlock,
            id: id
        }

        // 应答结果
        GetMVMgr().ResData(mName, ExploreMsg.EM_UnlockMapRes, res)
    }

    /**
     * 进入地图
     * @param id 地图ID
     */
    private doEnterMap(id: number) {
        // 进入结果
        let errEnter = GetMainMgr().EnterMap(id)

        // 构造应答数据
        let res = {
            err: errEnter,
            id: id
        }

        // 应答结果
        GetMVMgr().ResData(mName, ExploreMsg.EM_EnterMapRes, res)
    }
}

/**
 * 模块名
 */
const mName: string = "explore"

/**
 * 初始化结构体
 */
GetMVMgr().AddStruct(mName, new ExploreModel())