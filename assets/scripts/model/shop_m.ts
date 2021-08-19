import { IModel } from "../base/model"
import { ContainerType, CurrencyType } from "../data/common_d"
import { GetPropLib } from "../lib/prop_l"
import { GetMainMgr } from "../module/mainmgr"
import { GetMVMgr } from "../mv/mvmgr"
import { ContainerMsg, CurrencyMsg, ShopMsg } from "../mv/mvmsg"
import { Json2Tmp } from "../util/json"

/**
 * 商店模型
 */
export class ShopModel implements IModel {
    /**
     * 请求通知(视图请求)
     * @param msg 消息类型
     * @param data 请求数据
     */
    public ReqNotify(msg: string, data: any) {
        switch (msg) {
            // 货币信息
            case CurrencyMsg.CM_GetCurrencyReq:
                this.getCurrency()
                break
            // 背包列表
            case ContainerMsg.CM_PackReq:
                this.getPackList()
                break
            // 金币/威望商店
            case ShopMsg.SM_GoldGoodsReq:
            case ShopMsg.SM_PrestigeGoodsReq:
                this.getGoodsList(data)
                break
            // 购买商品
            case ShopMsg.SM_BuyReq:
                this.bugProp(data)
                break
            // 出售道具
            case ShopMsg.SM_SellReq:
                this.sellProp(data)
                break
        }
    }

    // === 私有方法处理 ===

    /**
     * 获取货币信息
     */
    private getCurrency() {
        // 货币信息
        let gold = GetMainMgr().GetCurrency(CurrencyType.CT_Gold)
        let prestige = GetMainMgr().GetCurrency(CurrencyType.CT_Prestige)

        // 构造应答数据
        let res = {
            [CurrencyType.CT_Gold]: gold,
            [CurrencyType.CT_Prestige]: prestige
        }

        // 应答货币信息
        GetMVMgr().ResData(mName, CurrencyMsg.CM_GetCurrencyRes, res)
    }

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
     * 获取商店列表
     * @param type 货币类型
     */
    private getGoodsList(type: number) {
        // 获取列表
        let list = GetPropLib().GetGoodsList(type)
        if (!list) {
            console.error("getGoodsList:获取列表失败")
            return
        }

        // 消息类型
        let msg = ShopMsg.SM_GoldGoodsRes
        if (type == CurrencyType.CT_Prestige) {
            msg = ShopMsg.SM_PrestigeGoodsRes
        }

        // 应答商品列表数据
        GetMVMgr().ResData(mName, msg, list)
    }

    /**
     * 购买商品
     * @param data 请求数据
     */
    private bugProp(data: any) {
        // 请求模板
        let req = {
            id: 0,
            count: 0,
            price: 0,
            type: 0
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("bugProp:解析购买请求失败")
            return
        }

        // 购买结果
        let errBug = GetMainMgr().BuyProp(req.id, req.count, req.price, req.type)

        // 构造应答数据
        let res = {
            err: errBug,
            id: req.id,
            count: req.count,
            price: req.price,
            type: req.type
        }

        // 应答结果
        GetMVMgr().ResData(mName, ShopMsg.SM_BuyRes, res)
    }

    /**
     * 出售商品
     * @param data 请求数据
     */
    private sellProp(data: any) {
        // 请求模板
        let req = {
            id: 0,
            count: 0,
            price: 0
        }

        // 解析请求
        if (!Json2Tmp(req, data)) {
            console.error("sellProp:解析出售请求失败")
            return
        }

        // 出售结果
        let errSell = GetMainMgr().SellProp(req.id, req.count, req.price)

        // 构造应答数据
        let res = {
            err: errSell,
            id: req.id,
            count: req.count,
            price: req.price
        }

        // 应答结果
        GetMVMgr().ResData(mName, ShopMsg.SM_SellRes, res)
    }
}

/**
 * 模块名
 */
const mName: string = "shop"

/**
 * 初始化结构体
 */
GetMVMgr().AddStruct(mName, new ShopModel())