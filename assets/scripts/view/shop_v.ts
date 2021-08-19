import { IView } from "../base/view"
import { CurrencyType } from "../data/common_d"
import { GoodsData, PropDataEx } from "../data/prop_d"
import { GetMVMgr } from "../mv/mvmgr"
import { ContainerMsg, CurrencyMsg, ShopMsg } from "../mv/mvmsg"
import { UIWindow } from "../ui/window/uiwindow"
import { ConvertRarity } from "../util/convert"
import { LoadPropIcon } from "../util/icon"
import { Json2Tmp } from "../util/json"

/**
 * ccc内置装饰器
 */
const { ccclass, property } = cc._decorator

/**
 * 道具商店
 * @extends UIWindow
 * @implements IView
 */
@ccclass
export default class ShopView extends UIWindow implements IView {
    @property(cc.ScrollView)
    private svShop: cc.ScrollView = null // 商店列表
    @property(cc.ScrollView)
    private svPack: cc.ScrollView = null // 背包列表
    @property(cc.Prefab)
    private pItem: cc.Prefab = null // 列表项预制体
    @property(cc.EditBox)
    private ebCount: cc.EditBox = null // 数量输入框
    @property(cc.Label)
    private lCurrency: cc.Label = null // 货币文本
    @property(cc.Label)
    private lPack: cc.Label = null // 背包空间文本
    @property(cc.Node)
    private nInfo: cc.Node = null // 道具信息节点

    private currency: { [type: number]: number } = {} // 货币信息
    private goldGoods: { [id: number]: GoodsData } = {} // 金币道具列表
    private prestigeGoods: { [id: number]: GoodsData } = {} // 威望道具列表
    private packProps: { [id: number]: PropDataEx } = {} // 背包道具列表
    private itemNodes: { [id: number]: cc.Node } = {} // 列表项记录
    private tab: number = 0 // 当前所在标签页
    private goodsID: number = 0 // 当前商品ID
    private packID: number = 0 // 当前背包道具ID
    private goodsItem: cc.Node = null // 当前商品节点
    private packItem: cc.Node = null // 当前道具节点
    private packSpace: number = 0 // 背包空间

    /**
     * 获取窗口名
     * @returns 窗口名
     */
    public Window(): string {
        return "shop"
    }

    /**
     * 响应通知(模型响应)
     * @param msg 消息类型
     * @param data 响应数据
     */
    public ResNotify(msg: string, data: any) {
        switch (msg) {
            // 货币信息
            case CurrencyMsg.CM_GetCurrencyRes:
                this.currency = data
                this.showCurrency()
                break
            // 背包列表
            case ContainerMsg.CM_PackRes:
                this.loadPackList(data)
                break
            // 金币商店列表
            case ShopMsg.SM_GoldGoodsRes:
                this.goldGoods = data
                this.loadGoodsList(data)
                break
            // 威望商店列表
            case ShopMsg.SM_PrestigeGoodsRes:
                this.prestigeGoods = data
                break
            // 购买结果
            case ShopMsg.SM_BuyRes:
                this.bugResult(data)
                break
            // 出售结果
            case ShopMsg.SM_SellRes:
                this.sellResult(data)
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

        // 清空商店列表
        for (let i = 0; i < this.svShop.content.childrenCount; i++) {
            this.svShop.content.children[i].destroy()
        }

        // 清理输入框
        this.ebCount.string = ""

        // 回到列表顶部
        this.svPack.scrollToTop()
        this.svShop.scrollToTop()

        // 清理数据
        this.clean()
    }

    /**
     * 启动通知
     * @param args 启动参数
     */
    protected startUp(...args: any[]): void {
        // 初始标签页
        this.tab = shopTab.ST_Gold

        // 获取货币信息
        GetMVMgr().ReqData(this.Window(), CurrencyMsg.CM_GetCurrencyReq, null)
        // 获取背包道具列表
        GetMVMgr().ReqData(this.Window(), ContainerMsg.CM_PackReq, null)
        // 获取金币道具列表
        GetMVMgr().ReqData(this.Window(), ShopMsg.SM_GoldGoodsReq, CurrencyType.CT_Gold)
        // 获取威望道具列表
        GetMVMgr().ReqData(this.Window(), ShopMsg.SM_PrestigeGoodsReq, CurrencyType.CT_Prestige)
    }

    /**
     * 切换标签页
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickTab(_: cc.Event, data: string) {
        console.log("onClickTab:切换标签页")

        // 过滤相同标签页
        if (this.tab == parseInt(data)) {
            return
        }

        // 修改标签页
        this.tab = parseInt(data)

        // 展示对应货币
        this.showCurrency()

        if (this.packItem) {
            // 隐藏背景
            this.switchEnable(this.packItem, false)
            // 清除道具ID
            this.packID = 0
            this.packItem = null
        }

        if (this.goodsItem) {
            // 隐藏背景
            this.switchEnable(this.goodsItem, false)
            // 清除商品ID
            this.goodsID = 0
            this.goodsItem = null
        }

        // 隐藏道具信息
        this.showPropInfo(false, null)

        // 加载列表
        if (this.tab == shopTab.ST_Gold) {
            this.loadGoodsList(this.goldGoods)
            return
        }
        this.loadGoodsList(this.prestigeGoods)
    }

    /**
     * 选中商品
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickGoods(event: cc.Event, data: string) {
        console.log("onClickGoods:选中商品")

        if (this.packItem) {
            // 隐藏背景
            this.switchEnable(this.packItem, false)
            // 清除道具ID
            this.packID = 0
        }

        if (this.goodsItem) {
            // 隐藏背景
            this.switchEnable(this.goodsItem, false)
        }

        // 记录信息
        this.goodsID = parseInt(data)
        this.goodsItem = (<cc.Node>event.target)

        // 显示背景
        this.switchEnable(this.goodsItem, true)

        // 显示道具信息
        this.showPropInfo(true, false)
    }

    /**
     * 选中背包道具
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickProp(event: cc.Event, data: string) {
        console.log("onClickProp:选中背包道具")

        if (this.packItem) {
            // 隐藏背景
            this.switchEnable(this.packItem, false)
        }

        if (this.goodsItem) {
            // 隐藏背景
            this.switchEnable(this.goodsItem, false)
            // 清除商品ID
            this.goodsID = 0
        }

        // 记录信息
        this.packID = parseInt(data)
        this.packItem = (<cc.Node>event.target)

        // 显示背景
        this.switchEnable(this.packItem, true)

        // 显示道具信息
        this.showPropInfo(true, true)
    }

    /**
     * 购买物品
     */
    protected onClickBuy() {
        console.log("onClickBuy:购买物品")

        // 校验选中商品
        if (!this.goodsID) {
            console.error("onClickBuy:未选中商品")
            return
        }

        // 校验购买数量
        if (!this.ebCount.string) {
            console.error("onClickBuy:购买数量无效")
            return
        }

        // 购买数量
        let count = parseInt(this.ebCount.string)

        // 获取商品信息
        let goods = this.goldGoods[this.goodsID]
        if (this.tab == shopTab.ST_Prestige) {
            goods = this.prestigeGoods[this.goodsID]
        }

        // 商品无效
        if (!goods) {
            console.error("onClickBuy:商品信息无效")
            return
        }

        // 构造请求数据
        let req = {
            id: goods.ID,
            count: count,
            price: goods.Sale,
            type: goods.Currency
        }

        // 请求购买
        GetMVMgr().ReqData(this.Window(), ShopMsg.SM_BuyReq, req)

        // 清理输入框
        this.ebCount.string = ""
    }

    /**
     * 出售物品
     */
    protected onClickSell() {
        console.log("onClickSell:出售物品")

        // 校验选中道具
        if (!this.packID) {
            console.error("onClickSell:未选中道具")
            return
        }

        // 校验出售数量
        if (!this.ebCount.string) {
            console.error("onClickSell:出售数量无效")
            return
        }

        // 出售数量
        let count = parseInt(this.ebCount.string)

        // 获取道具信息
        let prop = this.packProps[this.packID]
        if (!prop) {
            console.error("onClickSell:道具信息无效")
            return
        }

        // 构造请求数据
        let req = {
            id: prop.ID,
            count: count,
            price: prop.Data.Price
        }

        // 请求出售
        GetMVMgr().ReqData(this.Window(), ShopMsg.SM_SellReq, req)

        // 清理输入框
        this.ebCount.string = ""
    }

    // === 私有方法处理 ===

    /**
     * 展示货币信息
     */
    private showCurrency() {
        if (this.tab == shopTab.ST_Gold) {
            this.lCurrency.string = "金币：" + this.currency[CurrencyType.CT_Gold] || "-"
            return
        }
        this.lCurrency.string = "威望：" + this.currency[CurrencyType.CT_Prestige] || "-"
    }

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

        // 更新空间信息
        this.updateSpace()

        // 加载列表项
        for (let k in this.packProps) {
            this.addPackItem(this.packProps[k])
        }
    }

    /**
     * 加载商品列表
     * @param data 列表数据
     */
    private loadGoodsList(data: { [id: number]: GoodsData }) {
        // 清空商店列表
        for (let i = 0; i < this.svShop.content.childrenCount; i++) {
            this.svShop.content.children[i].destroy()
        }

        for (let k in data) {
            this.addShopItem(data[k])
        }
    }

    /**
     * 购买结果
     * @param data 结果信息
     */
    private bugResult(data: any) {
        // 结果模板
        let res = {
            err: "",
            id: 0,
            count: 0,
            price: 0,
            type: 0
        }

        // 解析结果
        if (!Json2Tmp(res, data)) {
            console.error("bugResult:解析购买结果失败")
            return
        }

        // 购买失败
        if (res.err) {
            console.error("bugResult:购买失败|" + res.err)
            return
        }

        // 更新货币
        this.currency[res.type] -= res.count * res.price
        this.showCurrency()

        // 背包道具不存在
        if (!this.packProps[res.id]) {
            // 获取商品信息
            let goods = this.goldGoods[res.id]
            if (this.tab == shopTab.ST_Prestige) {
                goods = this.prestigeGoods[res.id]
            }

            // 构造道具信息
            let prop = new PropDataEx()
            prop.ID = res.id
            prop.Count = 0
            prop.Data = goods.Data

            this.packProps[res.id] = prop

            // 更新空间信息
            this.updateSpace()
        }

        // 增加背包道具数量
        this.packProps[res.id].Count += res.count

        // 更新背包列表
        if (this.itemNodes[res.id]) {
            this.setItemInfo(this.itemNodes[res.id], this.packProps[res.id], true)
            return
        }

        // 添加列表项
        this.addPackItem(this.packProps[res.id])
    }

    /**
     * 出售结果
     * @param data 结果信息
     */
    private sellResult(data: any) {
        // 结果模板
        let res = {
            err: "",
            id: 0,
            count: 0,
            price: 0
        }

        // 解析结果
        if (!Json2Tmp(res, data)) {
            console.error("sellResult:解析出售结果失败")
            return
        }

        // 出售失败
        if (res.err) {
            console.error("sellResult:出售失败|" + res.err)
            return
        }

        // 更新货币
        this.currency[CurrencyType.CT_Gold] += res.count * res.price
        this.showCurrency()

        // 减少背包道具数量
        this.packProps[res.id].Count -= res.count
        if (this.packProps[res.id].Count <= 0) {
            // 移除背包道具信息
            delete this.packProps[res.id]

            // 移除列表项
            this.itemNodes[res.id].destroy()

            // 隐藏背景
            this.switchEnable(this.packItem, false)
            // 清除道具ID
            this.packID = 0
            this.packItem = null
            return
        }

        // 更新背包列表
        this.setItemInfo(this.itemNodes[res.id], this.packProps[res.id], true)
    }

    /**
     * 添加背包列表项
     * @param data 列表项信息
     */
    private addPackItem(data: PropDataEx) {
        // 实例化节点
        let item = cc.instantiate(this.pItem)

        // 设置列表项信息
        this.setItemInfo(item, data, true)

        // 添加到列表中
        this.svPack.content.addChild(item)

        // 记录节点
        this.itemNodes[data.ID] = item

        // 绑定按钮事件
        this.bindClickEvent(item, "onClickProp", data.ID.toString())
    }

    /**
     * 添加商店列表项
     * @param data 列表项信息
     */
    private addShopItem(data: GoodsData) {
        // 实例化节点
        let item = cc.instantiate(this.pItem)

        // 设置列表项信息
        this.setItemInfo(item, data, false)

        // 添加到列表中
        this.svShop.content.addChild(item)

        // 绑定按钮事件
        this.bindClickEvent(item, "onClickGoods", data.ID.toString())
    }

    /**
     * 设置列表项信息
     * @param node 列表项节点
     * @param data 列表项信息
     * @param pack 是否背包
     */
    private setItemInfo(node: cc.Node, data: GoodsData | PropDataEx, pack: boolean) {
        // 图标
        let sIcon = node.getChildByName("sprite_icon").getComponent(cc.Sprite)
        LoadPropIcon(sIcon, data.Data.Type)

        // 道具名
        node.getChildByName("label_name").getComponent(cc.Label).string = data.Data.Name
        // 价格
        node.getChildByName("label_price").getComponent(cc.Label).string = pack ? data.Data.Price.toString() : (<GoodsData>data).Sale.toString()
        // 标记
        node.getChildByName("label_mark").getComponent(cc.Label).string = pack ? (<PropDataEx>data).Count.toString() : "可叠加"
    }

    /**
     * 更新空间信息
     */
    private updateSpace() {
        this.lPack.string = "背包空间：" + Object.keys(this.packProps).length + "/" + this.packSpace
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
        let prop = null
        if (pack) {
            prop = this.packProps[this.packID].Data
        } else {
            prop = this.tab == shopTab.ST_Gold ? this.goldGoods[this.goodsID].Data : this.prestigeGoods[this.goodsID].Data
        }

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
        this.currency = {}
        this.goldGoods = {}
        this.prestigeGoods = {}
        this.packProps = {}
        this.itemNodes = {}
        this.goodsID = 0
        this.packID = 0
        this.goodsItem = null
        this.packItem = null
        this.packSpace = 0

        // 隐藏道具信息
        this.showPropInfo(false, null)

        // 切换到商店页
        this.onClickTab(null, shopTab.ST_Gold.toString())
    }
}

/**
 * 商店标签
 */
const enum shopTab {
    ST_Gold = 1, // 金币商店
    ST_Prestige = 2 // 威望商店
}