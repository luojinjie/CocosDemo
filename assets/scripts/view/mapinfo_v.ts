import { IView } from "../base/view";
import { MapData } from "../data/map_d";
import { PetData } from "../data/pet_d";
import { GetMVMgr } from "../mv/mvmgr";
import { ContainerMsg, FightMsg, MapInfoMsg } from "../mv/mvmsg";
import { UIWindow } from "../ui/window/uiwindow";
import { Json2Tmp } from "../util/json";
import { KeepDecimal } from "../util/math";

/**
 * ccc内置装饰器
 */
const { ccclass, property } = cc._decorator

/**
 * 地图信息视图
 * @extends UIWindow 
 * @implements IView
 */
@ccclass
export default class MapInfoView extends UIWindow implements IView {
    @property(cc.Node)
    private nCarry: cc.Node = null // 携带列表
    @property(cc.Prefab)
    private pCarryItem: cc.Prefab = null // 携带预制体
    @property(cc.Label)
    private lMapInfo: cc.Label = null // 地图信息

    private mapInfo: MapData = null // 地图信息
    private carryPets: PetData[] = [] // 携带宠物列表
    private mainIndex: number = -1 // 主战索引

    /**
     * 获取窗口名
     * @returns 窗口名
     */
    public Window(): string {
        return "mapinfo"
    }

    /**
     * 响应通知(模型响应)
     * @param msg 消息类型
     * @param data 响应数据
     */
    public ResNotify(msg: string, data: any) {
        switch (msg) {
            // 携带列表
            case ContainerMsg.CM_CarryRes:
                this.loadCarryList(data)
                break
            // 设置主战宠物
            case MapInfoMsg.MIM_SetMainRes:
                this.setMainResult(data)
                break
            // 进入战斗
            case MapInfoMsg.MIM_EnterFightRes:
                this.enterResult(data)
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
        // 清空携带列表
        for (let i = 0; i < this.nCarry.childrenCount; i++) {
            this.nCarry.children[i].destroy()
        }

        // 清理数据
        this.clean()
    }

    /**
     * 启动通知
     * @param args 启动参数
     */
    protected startUp(...args: any[]): void {
        // 校验启动参数
        if (!args.length) {
            console.error("startUp:缺少启动参数|" + this.Window())
            return
        }

        // 记录地图信息
        this.mapInfo = args[0]

        // 显示地图信息
        this.showMapInfo()

        // 获取携带宠物列表
        GetMVMgr().ReqData(this.Window(), ContainerMsg.CM_CarryReq, null)
    }

    /**
     * 设置宠物
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickPet(event: cc.Event, _: string) {
        // 目标节点
        let node = (<cc.Node>event.target)

        // 获取同级索引
        let index = node.getSiblingIndex()

        // 设置主战宠物
        GetMVMgr().ReqData(this.Window(), MapInfoMsg.MIM_SetMainReq, index)
    }

    /**
     * 进入战斗
     */
    protected onClickFight() {
        // 进入战斗
        GetMVMgr().ReqData(this.Window(), MapInfoMsg.MIM_EnterFightReq, this.mapInfo.ID)
    }

    /**
     * 离开地图
     */
    protected onClickLeave() {
        this.selfClose()
    }

    // === 私有方法处理 ===

    /**
     * 加载携带列表
     * @param data 携带数据
     */
    private loadCarryList(data: any) {
        // 数据模板
        let res = {
            list: [],
            main: 0
        }

        // 解析数据
        if (!Json2Tmp(res, data)) {
            console.error("loadCarryList:解析数据失败")
            return
        }

        // 记录信息
        this.carryPets = res.list
        this.mainIndex = res.main

        // 加载列表项
        for (let i = 0; i < this.carryPets.length; i++) {
            // 创建列表项
            let item = this.createCarryItem(this.carryPets[i])

            // 放大主战宠物图标
            if (i == this.mainIndex) {
                item.scale = 1.1
            }

            // 添加到列表中
            this.nCarry.addChild(item)
        }
    }

    /**
     * 设置结果
     * @param data 结果信息
     */
    private setMainResult(data: any) {
        // 结果模板
        let res = {
            err: "",
            index: 0
        }

        // 解析结果
        if (!Json2Tmp(res, data)) {
            console.error("setMainResult:解析设置结果失败")
            return
        }

        // 设置失败
        if (res.err) {
            console.error("setMainResult:设置失败|" + res.err)
            return
        }

        // 缩放宠物图标
        for (let i = 0; i < this.nCarry.childrenCount; i++) {
            this.nCarry.children[i].scale = res.index == i ? 1.1 : 1
        }

        this.mainIndex = res.index
    }

    /**
     * 进入结果
     * @param ok 是否成功
     */
    private enterResult(ok: boolean) {
        // 进入失败
        if (!ok) {
            console.error("enterResult:进入战斗失败")
            return
        }

        // 打开战斗窗口
        this.asyncShowWindow("prefabs/explore/fight", "fight", cc.find("Canvas/node_window"), null)
    }

    /**
     * 显示地图信息
     */
    private showMapInfo() {
        // 怪物名
        let list = ""
        for (let i = 0; i < this.mapInfo.Enemys.length; i++) {
            list += this.mapInfo.Enemys[i].Name
            if (i != this.mapInfo.Enemys.length - 1) {
                list += ","
            }
        }

        // 探险地图
        let map = "探险——" + this.mapInfo.Name
        // N:暂时固定写0
        let level = "怪物的等级：0"
        // 怪物列表
        let enemy = "出现的怪物：" + list

        // 组合信息
        this.lMapInfo.string = map + "\n" + level + "\n" + enemy
    }

    /**
     * 创建携带列表项
     * @param data 列表项信息
     * @returns 列表项节点
     */
    private createCarryItem(data: PetData): cc.Node {
        // 实例化节点
        let item = cc.instantiate(this.pCarryItem)

        // TODO:加载对应宠物图(资源尚未收集)

        // TEST:临时显示用
        {
            item.getChildByName("label_name").getComponent(cc.Label).string = data.Name
            item.getChildByName("label_level").getComponent(cc.Label).string = "LV " + data.Level.toString()
            item.getChildByName("label_growth").getComponent(cc.Label).string = "成长 " + KeepDecimal(data.Growth, 1).toString()
        }

        // 绑定按钮事件
        this.bindClickEvent(item, "onClickPet", null)

        return item
    }

    /**
     * 清理数据
     */
    private clean() {
        this.mapInfo = null
        this.carryPets = []
        this.mainIndex = -1
    }
}