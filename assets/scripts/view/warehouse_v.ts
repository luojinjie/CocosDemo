import { IView } from "../base/view"
import { PropDataEx } from "../data/prop_d"
import { GetMVMgr } from "../mv/mvmgr"
import { ContainerMsg, WarehouseMsg } from "../mv/mvmsg"
import { UIWindow } from "../ui/window/uiwindow"
import { ConvertRarity } from "../util/convert"
import { LoadPropIcon } from "../util/icon"
import { Json2Tmp } from "../util/json"

/**
 * ccc内置装饰器
 */
const { ccclass, property } = cc._decorator

/**
 * 用户仓库
 * @extends UIWindow 
 * @implements IView
 */
@ccclass
export default class WarehouseView extends UIWindow implements IView {
    @property(cc.ScrollView)
    private svWarehouse: cc.ScrollView = null // 仓库道具列表
    @property(cc.ScrollView)
    private svPack: cc.ScrollView = null // 背包道具列表
    @property(cc.Prefab)
    private pItem: cc.Prefab = null // 列表项预制体
    @property(cc.EditBox)
    private ebCount: cc.EditBox = null // 数量输入框
    @property(cc.Label)
    private lWarehouse: cc.Label = null // 仓库空间文本
    @property(cc.Label)
    private lPack: cc.Label = null // 背包空间文本
    @property(cc.Node)
    private nInfo: cc.Node = null // 道具信息节点

    private warehouseProps: { [id: number]: PropDataEx } = {} // 仓库道具列表
    private packProps: { [id: number]: PropDataEx } = {} // 背包道具列表
    private warehouseNodes: { [id: number]: cc.Node } = {} // 仓库列表项记录
    private packNodes: { [id: number]: cc.Node } = {} // 背包列表项记录
    private warehouseID: number = 0 // 当前仓库道具ID
    private packID: number = 0 // 当前背包道具ID
    private warehouseItem: cc.Node = null // 当前商品节点
    private packItem: cc.Node = null // 当前道具节点
    private packSpace: number = 0 // 背包空间
    private warehouseSpace: number = 0 // 仓库空间

    /**
     * 获取窗口名
     * @returns 窗口名
     */
    public Window(): string {
        return "warehouse"
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
            // 仓库列表
            case ContainerMsg.CM_WarehouseRes:
                this.loadWarehouseList(data)
                break
            // 放入结果
            case WarehouseMsg.WM_TakeInRes:
                this.takeInResult(data)
                break
            // 取出结果
            case WarehouseMsg.WM_TakeOutRes:
                this.takeOutResult(data)
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
        for (let i = 0; i < this.svPack.content.childrenCount; i++) {
            this.svPack.content.children[i].destroy()
        }

        // 清空仓库列表
        for (let i = 0; i < this.svWarehouse.content.childrenCount; i++) {
            this.svWarehouse.content.children[i].destroy()
        }

        // 清理输入框
        this.ebCount.string = ""

        // 回到列表顶部
        this.svPack.scrollToTop()
        this.svWarehouse.scrollToTop()

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
        // 获取仓库道具列表
        GetMVMgr().ReqData(this.Window(), ContainerMsg.CM_WarehouseReq, null)
    }

    /**
     * 放入仓库
     */
    protected onClickTakeIn() {
        console.log("onClickTakeIn:放入仓库")

        // 校验选中道具
        if (!this.packID) {
            console.error("onClickTakeIn:未选中道具")
            return
        }

        // 校验放入数量
        if (!this.ebCount.string) {
            console.error("onClickTakeIn:放入数量无效")
            return
        }

        // 放入数量
        let count = parseInt(this.ebCount.string)

        // 构造请求数据
        let req = {
            id: this.packID,
            count: count
        }

        // 请求放入
        GetMVMgr().ReqData(this.Window(), WarehouseMsg.WM_TakeInReq, req)

        // 清理输入框
        this.ebCount.string = ""
    }

    /**
     * 取出仓库
     */
    protected onClickTakeOut() {
        console.log("onClickTakeOut:取出仓库")

        // 校验选中道具
        if (!this.warehouseID) {
            console.error("onClickTakeOut:未选中道具")
            return
        }

        // 校验取出数量
        if (!this.ebCount.string) {
            console.error("onClickTakeOut:取出数量无效")
            return
        }

        // 取出数量
        let count = parseInt(this.ebCount.string)

        // 构造请求数据
        let req = {
            id: this.warehouseID,
            count: count
        }

        // 请求取出
        GetMVMgr().ReqData(this.Window(), WarehouseMsg.WM_TakeOutReq, req)

        // 清理输入框
        this.ebCount.string = ""
    }

    /**
     * 选中道具
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickProp(event: cc.Event, data: string) {
        console.log("onClickProp:选中道具")

        // 数据模板
        let res = {
            id: 0,
            pack: false
        }

        // 解析结果
        if (!Json2Tmp(res, data)) {
            console.error("onClickProp:解析自定义数据失败")
            return
        }

        if (this.packItem) {
            // 隐藏背景
            this.switchEnable(this.packItem, false)
            // 清除道具ID
            this.packID = 0
        }

        if (this.warehouseItem) {
            // 隐藏背景
            this.switchEnable(this.warehouseItem, false)
            // 清除道具ID
            this.warehouseID = 0
        }

        // 目标节点
        let node = (<cc.Node>event.target)

        // 记录信息
        if (res.pack) {
            this.packID = res.id
            this.packItem = node
        } else {
            // 记录信息
            this.warehouseID = res.id
            this.warehouseItem = node
        }

        // 显示背景
        this.switchEnable(node, true)

        // 显示道具信息
        this.showPropInfo(true, res.pack)
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

        // 记录信息
        this.packProps = res.list
        this.packSpace = res.space

        // 更新背包空间信息
        this.updateSpace(true)

        // 加载列表项
        for (let k in this.packProps) {
            this.addPackItem(this.packProps[k])
        }
    }

    /**
     * 加载仓库列表
     * @param data 仓库数据
     */
    private loadWarehouseList(data: any) {
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

        // 记录信息
        this.warehouseProps = res.list
        this.warehouseSpace = res.space

        // 更新仓库空间信息
        this.updateSpace(false)

        // 加载列表项
        for (let k in this.warehouseProps) {
            this.addWarehouseItem(this.warehouseProps[k])
        }
    }

    /**
     * 放入结果
     * @param data 结果信息
     */
    private takeInResult(data: any) {
        // 结果模板
        let res = {
            err: "",
            id: 0,
            count: 0
        }

        // 解析结果
        if (!Json2Tmp(res, data)) {
            console.error("takeInResult:解析放入结果失败")
            return
        }

        // 放入失败
        if (res.err) {
            console.error("takeInResult:放入失败|" + res.err)
            return
        }

        // 仓库道具不存在
        if (!this.warehouseProps[res.id]) {
            // 构造道具信息
            let prop = new PropDataEx()
            prop.ID = res.id
            prop.Count = 0
            prop.Data = this.packProps[res.id].Data

            this.warehouseProps[res.id] = prop

            // 更新仓库空间信息
            this.updateSpace(false)
        }

        // 增加仓库道具
        this.warehouseProps[res.id].Count += res.count

        // 减少背包道具
        this.packProps[res.id].Count -= res.count
        if (this.packProps[res.id].Count <= 0) {
            // 移除列表项
            this.packNodes[res.id].destroy()
            // 移除背包道具信息
            delete this.packProps[res.id]
            // 移除节点记录
            delete this.packNodes[res.id]
            this.packItem = null

            // 更新背包空间信息
            this.updateSpace(true)
            // 隐藏道具信息
            this.showPropInfo(false, null)
        } else {
            // 更新信息
            this.setItemInfo(this.packNodes[res.id], this.packProps[res.id])
        }

        // 更新仓库列表
        if (this.warehouseNodes[res.id]) {
            this.setItemInfo(this.warehouseNodes[res.id], this.warehouseProps[res.id])
            return
        }

        // 添加列表项
        this.addWarehouseItem(this.warehouseProps[res.id])
    }

    /**
     * 取出结果
     * @param data 结果信息
     */
    private takeOutResult(data: any) {
        // 结果模板
        let res = {
            err: "",
            id: 0,
            count: 0
        }

        // 解析结果
        if (!Json2Tmp(res, data)) {
            console.error("takeOutResult:解析取出结果失败")
            return
        }

        // 取出失败
        if (res.err) {
            console.error("takeOutResult:取出失败|" + res.err)
            return
        }

        // 背包道具不存在
        if (!this.packProps[res.id]) {
            // 构造道具信息
            let prop = new PropDataEx()
            prop.ID = res.id
            prop.Count = 0
            prop.Data = this.warehouseProps[res.id].Data

            this.packProps[res.id] = prop

            // 更新背包空间信息
            this.updateSpace(true)
        }

        // 增加背包道具
        this.packProps[res.id].Count += res.count

        // 减少仓库道具
        this.warehouseProps[res.id].Count -= res.count
        if (this.warehouseProps[res.id].Count <= 0) {
            // 移除列表项
            this.warehouseNodes[res.id].destroy()
            // 移除仓库道具信息
            delete this.warehouseProps[res.id]
            // 移除节点记录
            delete this.warehouseNodes[res.id]
            this.warehouseItem = null

            // 更新仓库空间信息
            this.updateSpace(false)
            // 隐藏道具信息
            this.showPropInfo(false, null)
        } else {
            // 更新信息
            this.setItemInfo(this.warehouseNodes[res.id], this.warehouseProps[res.id])
        }

        // 更新背包列表
        if (this.packNodes[res.id]) {
            this.setItemInfo(this.packNodes[res.id], this.packProps[res.id])
            return
        }

        // 添加列表项
        this.addPackItem(this.packProps[res.id])
    }

    /**
     * 添加背包列表项
     * @param data 列表项信息
     */
    private addPackItem(data: PropDataEx) {
        // 实例化节点
        let item = cc.instantiate(this.pItem)

        // 设置列表项信息
        this.setItemInfo(item, data)

        // 添加到列表中
        this.svPack.content.addChild(item)

        // 记录节点
        this.packNodes[data.ID] = item

        // 构造数据
        let json = {
            id: data.ID,
            pack: true // 是否背包
        }

        // 绑定按钮事件
        this.bindClickEvent(item, "onClickProp", JSON.stringify(json))
    }

    /**
     * 添加仓库列表项
     * @param data 列表项信息
     */
    private addWarehouseItem(data: PropDataEx) {
        // 实例化节点
        let item = cc.instantiate(this.pItem)

        // 设置列表项信息
        this.setItemInfo(item, data)

        // 添加到列表中
        this.svWarehouse.content.addChild(item)

        // 记录节点
        this.warehouseNodes[data.ID] = item

        // 构造数据
        let json = {
            id: data.ID,
            pack: false // 是否背包
        }

        // 绑定按钮事件
        this.bindClickEvent(item, "onClickProp", JSON.stringify(json))
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
        // 价格
        node.getChildByName("label_price").getComponent(cc.Label).string = data.Data.Price.toString()
        // 标记
        node.getChildByName("label_mark").getComponent(cc.Label).string = data.Count.toString()
    }

    /**
     * 更新空间信息
     * @param pack 是否背包
     */
    private updateSpace(pack: boolean) {
        // 背包
        if (pack) {
            this.lPack.string = "背包空间：" + Object.keys(this.packProps).length + "/" + this.packSpace
            return
        }

        // 仓库
        this.lWarehouse.string = "仓库空间：" + Object.keys(this.warehouseProps).length + "/" + this.warehouseSpace
    }

    /**
     * 切换节点启用状态
     * @param node 节点
     * @param enable 是否启用
     */
    private switchEnable(node: cc.Node, enable: boolean) {
        // 隐藏背景
        let spr = node.getComponent(cc.Sprite)
        if (!spr) {
            console.error("节点无效")
            return
        }

        spr.enabled = enable
    }

    /**
     * 显示道具信息
     * @param state 显示状态
     * @param pack 是否背包
     */
    private showPropInfo(state: boolean, pack: boolean) {
        this.nInfo.active = state
        if (!state) {
            return
        }

        // 道具信息
        let prop = pack ? this.packProps[this.packID].Data : this.warehouseProps[this.warehouseID].Data

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
        this.warehouseProps = {}
        this.packProps = {}
        this.warehouseNodes = {}
        this.packNodes = {}
        this.warehouseID = 0
        this.packID = 0
        this.warehouseItem = null
        this.packItem = null
        this.packSpace = 0
        this.warehouseSpace = 0

        // 隐藏道具信息
        this.showPropInfo(false, null)
    }
}