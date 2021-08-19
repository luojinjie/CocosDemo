import { IView } from "../../base/view"
import { UIBase } from "../../ui/uibase/uibase"

/**
 * ccc内置装饰器
 */
const { ccclass, property } = cc._decorator

/**
 * 中心城镇
 * @extends UIBase
 * @implements IView
 */
@ccclass
export default class City extends UIBase implements IView {
    @property(cc.Node)
    private nLeft: cc.Node = null // 左侧中心城镇

    @property(cc.Node)
    private nRight: cc.Node = null // 右侧中心城镇

    /**
     * 响应通知(模型响应)
     * @param msg 消息类型
     * @param data 响应数据
     */
    public ResNotify(msg: string, data: any) { }

    /**
     * ccc激活
     */
    protected onEnable() {
        this.onClickSwitch(null, cityType.CT_Left.toString())
    }

    /**
     * 中心城镇切换按钮事件
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickSwitch(_: cc.Event, data: string) {
        this.switchCity(parseInt(data))
    }

    /**
     * 商店按钮事件
     */
    protected onClickShop() {
        this.asyncShowWindow("prefabs/city/shop", "shop", cc.find("Canvas/node_window"), null)
    }

    /**
     * 仓库按钮事件
     */
    protected onClickWarehouse() {
        this.asyncShowWindow("prefabs/city/warehouse", "warehouse", cc.find("Canvas/node_window"), null)
    }

    /**
     * 牧场按钮事件
     */
    protected onClickRanch() {
        this.asyncShowWindow("prefabs/city/ranch", "ranch", cc.find("Canvas/node_window"), null)
    }

    /**
     * 宠物神殿按钮事件
     */
    protected onClickTemple() {
        this.asyncShowWindow("prefabs/city/temple", "temple", cc.find("Canvas/node_window"), null)
    }

    // === 私有方法处理 ===

    /**
     * 切换城镇类型
     * @param type 城镇类型
     */
    private switchCity(type: number) {
        this.nLeft.active = type == cityType.CT_Left
        this.nRight.active = type == cityType.CT_Right
    }
}

/**
 * 城镇类型
 */
enum cityType {
    CT_Left = 1, // 左城镇
    CT_Right = 2 // 右城镇
}