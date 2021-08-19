import { IView } from "../../base/view"
import { InstanceMap, MapData, MapType, NormarlMap } from "../../data/map_d"
import { GetMVMgr } from "../../mv/mvmgr"
import { ExploreMsg } from "../../mv/mvmsg"
import { UIBase } from "../../ui/uibase/uibase"
import { Json2Tmp } from "../../util/json"

/**
 * ccc内置装饰器
 */
const { ccclass, property } = cc._decorator

/**
 * 野外探险
 * @extends UIBase
 * @implements IView
 */
@ccclass
export default class Explore extends UIBase implements IView {
    @property(cc.Node)
    private nBottom: cc.Node = null // 下侧野外位置
    @property(cc.Node)
    private nTop: cc.Node = null // 上侧野外位置

    private mapLists: { [id: number]: MapData } = {} // 地图列表
    private mapNodes: { [id: number]: cc.Node } = {} // 地图节点

    /**
     * 响应通知(模型响应)
     * @param msg 消息类型
     * @param data 响应数据
     */
    public ResNotify(msg: string, data: any) {
        switch (msg) {
            // 地图列表
            case ExploreMsg.EM_MapListRes:
                this.initMap(data)
                break
            // 解锁地图
            case ExploreMsg.EM_UnlockMapRes:
                this.unlockResult(data)
                break
            // 进入地图
            case ExploreMsg.EM_EnterMapRes:
                this.enterResult(data)
                break
        }
    }

    /**
     * ccc加载
     */
    protected onLoad() {
        // 绑定视图
        GetMVMgr().BindView(vName, this)

        // 获取地图列表
        GetMVMgr().ReqData(vName, ExploreMsg.EM_MapListReq, null)
    }

    /**
     * ccc激活
     */
    protected onEnable() {
        this.onClickSwitch(null, exploreType.CT_Bottom.toString())
    }

    /**
     * 野外探险切换按钮事件
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickSwitch(_: cc.Event, data: string) {
        this.switchExplore(parseInt(data))
    }

    /**
     * 地图按钮事件
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickMap(_: cc.Event, data: string) {
        // 地图ID
        let mid = parseInt(data)

        // 地图信息
        let map = this.mapLists[mid]
        if (!map) {
            console.error("onClickMap:地图不存在")
            return
        }

        // 普通地图
        if (map.Type == MapType.MT_Normal) {
            // 解锁状态
            let unlocked = (<NormarlMap>map).Unlocked
            if (unlocked) {
                GetMVMgr().ReqData(vName, ExploreMsg.EM_EnterMapReq, mid)
            } else {
                GetMVMgr().ReqData(vName, ExploreMsg.EM_UnlockMapReq, mid)
            }
        }

        // 副本地图
        if (map.Type == MapType.MT_Instance) {
            GetMVMgr().ReqData(vName, ExploreMsg.EM_EnterMapReq, mid)
        }

        // 特殊地图
        if (map.Type == MapType.MT_Special) {
            // TODO:未有特殊地图
        }
    }

    // === 私有方法处理 ===

    /**
     * 切换野外类型
     * @param type 野外类型
     */
    private switchExplore(type: number) {
        this.nBottom.active = type == exploreType.CT_Bottom
        this.nTop.active = type == exploreType.CT_Top
    }

    /**
     * 初始化地图列表
     * @param data 地图列表
     */
    private initMap(data: { [id: number]: MapData }) {
        // 记录信息
        this.mapLists = data

        // TODO:显示已开启的地图

        // 地图根节点
        let norNode = cc.find("node_map_bottom/node_normal", this.node)
        let insNode = cc.find("node_map_bottom/node_instance", this.node)

        // 初始信息
        let norIndex = 0
        let insIndex = 0
        let mapNode = null
        for (let k in this.mapLists) {
            if (this.mapLists[k].Type == MapType.MT_Normal) {
                mapNode = norNode.children[norIndex]
                norIndex++
            } else if (this.mapLists[k].Type == MapType.MT_Instance) {
                mapNode = insNode.children[insIndex]
                insIndex++
            } else {
                // TODO:特殊地图
            }

            // 绑定地图信息
            this.bindMapInfo(mapNode, this.mapLists[k])
        }
    }

    /**
     * 解锁地图结果
     * @param data 结果信息
     */
    private unlockResult(data: any) {
        // 结果模板
        let res = {
            err: "",
            id: 0
        }

        // 解析结果
        if (!Json2Tmp(res, data)) {
            console.error("unlockResult:解析解锁结果失败")
            return
        }

        // 解锁失败
        if (res.err) {
            console.error("unlockResult:解锁失败|" + res.err)
            return
        }

        // 记录已解锁
        (<NormarlMap>this.mapLists[res.id]).Unlocked = true

        // 显示已开启状态
        this.mapNodes[res.id].getComponent(cc.Sprite).enabled = true
    }

    /**
     * 进入地图结果
     * @param data 结果信息
     */
    private enterResult(data: any) {
        // 结果模板
        let res = {
            err: "",
            id: 0
        }

        // 解析结果
        if (!Json2Tmp(res, data)) {
            console.error("enterResult:解析进入结果失败")
            return
        }

        // 进入失败
        if (res.err) {
            console.error("enterResult:进入失败|" + res.err)
            return
        }

        // 打开地图信息窗口
        this.asyncShowWindow("prefabs/explore/mapinfo", "mapinfo", cc.find("Canvas/node_window"), null, this.mapLists[res.id])
    }

    /**
     * 绑定地图信息
     * @param node 地图节点
     * @param map 地图信息
     */
    private bindMapInfo(node: cc.Node, map: MapData) {
        // 普通地图
        if (map.Type == MapType.MT_Normal) {
            // 解锁状态
            node.getComponent(cc.Sprite).enabled = (<NormarlMap>map).Unlocked
        }

        // 记录节点
        this.mapNodes[map.ID] = node

        // 绑定按钮事件
        this.bindClickEvent(node, "onClickMap", map.ID.toString())
    }
}

/**
 * 野外类型
 */
enum exploreType {
    CT_Bottom = 1, // 下野外
    CT_Top = 2 // 上野外
}

/**
 * 视图名
 */
const vName = "explore"