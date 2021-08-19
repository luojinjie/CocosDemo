import { IView } from "../base/view"
import { PropDataEx } from "../data/prop_d"
import { GetMVMgr } from "../mv/mvmgr"
import { BackpackMsg, ContainerMsg } from "../mv/mvmsg"
import { UIWindow } from "../ui/window/uiwindow"
import { ConvertPropType, ConvertRarity } from "../util/convert"
import { LoadPropIcon } from "../util/icon"
import { Json2Tmp } from "../util/json"

/**
 * ccc内置装饰器
 */
const { ccclass, property } = cc._decorator

/**
 * 用户背包
 * @extends UIWindow
 * @implements IView
 */
@ccclass
export default class BackpackView extends UIWindow implements IView {
    @property(cc.ScrollView)
    private svList: cc.ScrollView = null // 列表视图
    @property(cc.Prefab)
    private pItem: cc.Prefab = null // 列表项预制体
    @property(cc.Label)
    private lPack: cc.Label = null // 背包空间
    @property(cc.Node)
    private nInfo: cc.Node = null // 道具信息节点

    private packProps: { [id: number]: PropDataEx } = {} // 背包道具列表
    private curPID: number = 0 // 当前背包道具ID
    private curItem: cc.Node = null // 当前道具节点
    private packSpace: number = 0 // 背包空间

    /**
     * 获取窗口名
     * @returns 窗口名
     */
    public Window(): string {
        return "backpack"
    }

    /**
     * 响应通知(模型响应)
     * @param msg 消息类型
     * @param data 响应数据
     */
    public ResNotify(msg: string, data: any) {
        switch (msg) {
            // 背包列表
            case ContainerMsg.CM_PackRes:
                this.loadPackList(data)
                break
            // 使用结果
            case BackpackMsg.PM_UseRes:
                this.useResult(data)
                break
            // N:丢弃和放入对于UI展示来说效果是一致,所以偷懒共用接口
            // 丢弃/放入结果
            case BackpackMsg.PM_DropRes:
            case BackpackMsg.PM_IntoRes:
                this.dropResult(data)
                break
        }
    }

    /**
     * ccc加载
     */
    protected onLoad() {
        // 父类加载
        super.onLoad()

        // 绑定视图
        GetMVMgr().BindView(this.Window(), this)
    }

    /**
     * ccc禁用
     */
    protected onDisable() {
        // 清空背包列表
        for (let i = 0; i < this.svList.content.childrenCount; i++) {
            this.svList.content.children[i].destroy()
        }

        // 清理数据
        this.clean()
    }

    /**
     * 启动通知
     * @param args 启动参数
     */
    protected startUp(...args: any[]): void {
        // 获取背包道具列表
        GetMVMgr().ReqData(this.Window(), ContainerMsg.CM_PackReq, null)
    }

    /**
     * 选中背包道具
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickProp(event: cc.Event, data: string) {
        if (this.curItem) {
            // 隐藏背景
            this.curItem.getComponent(cc.Sprite).enabled = false
        }

        // 记录信息
        this.curPID = parseInt(data)
        this.curItem = (<cc.Node>event.target)

        // 显示背景
        this.curItem.getComponent(cc.Sprite).enabled = true

        // 显示道具信息
        this.showPropInfo(true)
    }

    /**
     * 使用道具
     */
    protected onClickUse() {
        // 构造请求数据
        let req = {
            id: this.curPID,
            count: 1
        }

        // 请求使用
        GetMVMgr().ReqData(this.Window(), BackpackMsg.PM_UseReq, req)
    }

    /**
     * 丢弃道具
     */
    protected onClickDrop() {
        // 获取道具信息
        let prop = this.packProps[this.curPID]
        if (!prop) {
            console.error("onClickDrop:道具信息无效")
            return
        }

        // 构造请求数据
        let req = {
            id: prop.ID,
            count: prop.Count
        }

        // 请求丢弃
        GetMVMgr().ReqData(this.Window(), BackpackMsg.PM_DropReq, req)
    }

    /**
     * 放入仓库
     */
    protected onClickInto() {
        // 获取道具信息
        let prop = this.packProps[this.curPID]
        if (!prop) {
            console.error("onClickInto:道具信息无效")
            return
        }

        // 构造请求数据
        let req = {
            id: prop.ID,
            count: prop.Count
        }

        // 请求放入仓库
        GetMVMgr().ReqData(this.Window(), BackpackMsg.PM_IntoReq, req)
    }

    /**
     * 刷新背包
     */
    protected onClickRefresh() {
        // 清空背包列表
        for (let i = 0; i < this.svList.content.childrenCount; i++) {
            this.svList.content.children[i].destroy()
        }

        // 获取背包道具列表
        GetMVMgr().ReqData(this.Window(), ContainerMsg.CM_PackReq, null)
    }

    // === 私有方法处理 ===

    /**
     * 加载背包列表
     * @param data 背包数据
     */
    private loadPackList(data: any) {
        // 数据模板
        let res = {
            list: {},
            space: 0
        }

        // 解析数据
        if (!Json2Tmp(res, data)) {
            console.error("loadPackList:解析数据失败")
            return
        }

        // 记录列表
        this.packProps = res.list
        this.packSpace = res.space

        // 更新空间信息
        this.updateSpace()

        // 加载列表项
        for (let k in this.packProps) {
            let item = cc.instantiate(this.pItem)

            // 设置列表项信息
            this.setItemInfo(item, this.packProps[k])

            // 添加到列表中
            this.svList.content.addChild(item)

            // 绑定按钮事件
            this.bindClickEvent(item, "onClickProp", this.packProps[k].ID.toString())
        }
    }

    /**
     * 使用结果
     * @param data 结果信息
     */
    private useResult(data: any) {
        // 结果模板
        let res = {
            err: "",
            id: 0
        }

        // 解析结果
        if (!Json2Tmp(res, data)) {
            console.error("useResult:解析使用结果失败")
            return
        }

        // 使用失败
        if (res.err) {
            console.error("useResult:使用失败|" + res.err)
            return
        }

        // 减少道具数量
        this.packProps[res.id].Count--

        // 更新列表项的数量显示
        this.setItemInfo(this.curItem, this.packProps[res.id])
    }

    /**
     * 丢弃结果
     * @param data 结果信息
     */
    private dropResult(data: any) {
        // 结果模板
        let res = {
            err: "",
            id: 0
        }

        // 解析结果
        if (!Json2Tmp(res, data)) {
            console.error("dropResult:解析丢弃结果失败")
            return
        }

        // 丢弃失败
        if (res.err) {
            console.error("useResult:丢弃失败|" + res.err)
            return
        }

        // 移除道具信息
        delete this.packProps[res.id]

        // 移除对应列表项
        this.curItem.destroy()
        this.curItem = null

        // 隐藏道具信息
        this.showPropInfo(false)

        // 更新空间信息
        this.updateSpace()
    }

    /**
     * 设置列表项信息
     * @param node 列表项节点
     * @param data 列表项信息
     */
    private setItemInfo(node: cc.Node, data: PropDataEx) {
        // 图标
        let sIcon = node.getChildByName("sprite_icon").getComponent(cc.Sprite)
        LoadPropIcon(sIcon, data.Data.Type)

        // 道具名
        node.getChildByName("label_name").getComponent(cc.Label).string = data.Data.Name
        // 道具类型
        node.getChildByName("label_type").getComponent(cc.Label).string = ConvertPropType(data.Data.Type)
        // 持有数量
        node.getChildByName("label_count").getComponent(cc.Label).string = data.Count == 0 ? "-" : data.Count.toString()
    }

    /**
     * 更新空间信息
     */
    private updateSpace() {
        this.lPack.string = "当前背包空间：" + Object.keys(this.packProps).length + "/" + this.packSpace
    }

    /**
     * 显示道具信息
     * @param state 显示状态
     */
    private showPropInfo(state: boolean) {
        this.nInfo.active = state
        if (!state) {
            return
        }

        // 道具信息
        let prop = this.packProps[this.curPID].Data

        // 道具名
        let nName = this.nInfo.getChildByName("label_name")
        nName.color = cc.color().fromHEX(ConvertRarity(prop.Rarity))
        nName.getComponent(cc.Label).string = prop.Name
        // 可否交易
        this.nInfo.getChildByName("label_tradable").getComponent(cc.Label).string = prop.Tradable ? "可交易" : "不可交易"
        // 有效期(TODO:日期转换,目前道具没有限制时间)
        this.nInfo.getChildByName("label_validity").getComponent(cc.Label).string = "永久"
        // 描述
        this.nInfo.getChildByName("label_describe").getComponent(cc.Label).string = prop.Describe
    }

    /**
     * 清理数据
     */
    private clean() {
        this.packProps = {}
        this.curPID = 0
        this.curItem = null

        // 隐藏道具信息
        this.showPropInfo(false)
    }
}