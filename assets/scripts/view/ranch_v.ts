import { IView } from "../base/view"
import { PetData } from "../data/pet_d"
import { GetMVMgr } from "../mv/mvmgr"
import { ContainerMsg, RanchMsg } from "../mv/mvmsg"
import { UIWindow } from "../ui/window/uiwindow"
import { ConvertDept } from "../util/convert"
import { Json2Tmp } from "../util/json"
import { KeepDecimal } from "../util/math"

/**
 * ccc内置装饰器
 */
const { ccclass, property } = cc._decorator

/**
 * 用户牧场
 * @extends UIWindow 
 * @implements IView
 */
@ccclass
export default class RanchView extends UIWindow implements IView {
    @property(cc.ScrollView)
    private svRanch: cc.ScrollView = null // 牧场列表
    @property(cc.Node)
    private nCarry: cc.Node = null // 携带列表
    @property(cc.Prefab)
    private pRanchItem: cc.Prefab = null // 牧场预制体
    @property(cc.Prefab)
    private pCarryItem: cc.Prefab = null // 携带预制体
    @property(cc.Label)
    private lRanch: cc.Label = null // 牧场空间文本
    @property(cc.Node)
    private nArrow: cc.Node = null // 箭头节点
    @property(cc.Node)
    private nInfo: cc.Node = null // 宠物信息节点

    private ranchPets: PetData[] = [] // 牧场宠物列表
    private carryPets: PetData[] = [] // 携带宠物列表
    private ranchIndex: number = -1 // 当前牧场宠物索引
    private carryIndex: number = -1 // 当前携带宠物索引
    private ranchItem: cc.Node = null // 当前牧场宠物节点
    private mainIndex: number = -1 // 主战索引
    private ranchSpace: number = 0 // 牧场空间
    private carryPos: number[] = [] // 携带宠物x轴世界坐标

    /**
     * 获取窗口名
     * @returns 窗口名
     */
    public Window(): string {
        return "ranch"
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
            // 牧场列表
            case ContainerMsg.CM_RanchRes:
                this.loadRanchList(data)
                break
            // 放入结果
            case RanchMsg.RM_TakeInRes:
                this.takeInResult(data)
                break
            // 取出结果
            case RanchMsg.RM_TakeOutRes:
                this.takeOutResult(data)
                break
            // 设置主战宠物
            case RanchMsg.RM_SetMainRes:
                this.setMainResult(data)
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

        // 获取携带宠物x轴世界坐标
        for (let i = this.nCarry.childrenCount - 1; i >= 0; i--) {
            let item = this.nCarry.children[i]

            // 记录x轴世界坐标
            this.carryPos.unshift(item.convertToWorldSpaceAR(cc.v2()).x)

            // N:为了简单使用逻辑不饶,这里直接取完位置就删除节点
            item.destroy()
        }
    }

    /**
     * ccc禁用
     */
    protected onDisable() {
        // 清空携带列表
        for (let i = 0; i < this.nCarry.childrenCount; i++) {
            this.nCarry.children[i].destroy()
        }

        // 清空牧场列表
        for (let i = 0; i < this.svRanch.content.childrenCount; i++) {
            this.svRanch.content.children[i].destroy()
        }

        // 回到列表顶部
        this.svRanch.scrollToTop()

        // 清理数据
        this.clean()
    }

    /**
     * 启动通知
     * @param args 启动参数
     */
    protected startUp(...args: any[]): void {
        // 获取携带宠物列表
        GetMVMgr().ReqData(this.Window(), ContainerMsg.CM_CarryReq, null)
        // 获取牧场宠物列表
        GetMVMgr().ReqData(this.Window(), ContainerMsg.CM_RanchReq, null)
    }

    /**
     * 放入牧场
     */
    protected onClickTakeIn() {
        // 最少携带1只宠物
        if (this.carryPets.length == 1) {
            console.error("onClickTakeIn:最少携带1只宠物")
            return
        }

        // 校验选中携带宠物
        if (this.carryIndex < 0) {
            console.error("onClickTakeOut:未选中携带宠物")
            return
        }

        // 请求放入
        GetMVMgr().ReqData(this.Window(), RanchMsg.RM_TakeInReq, this.carryIndex)
    }

    /**
     * 取出牧场
     */
    protected onClickTakeOut() {
        // 校验选中牧场宠物
        if (this.ranchIndex < 0) {
            console.error("onClickTakeOut:未选中牧场宠物")
            return
        }

        // 最多携带3只宠物
        if (this.carryPets.length == 3) {
            console.error("onClickTakeIn:最多携带3只宠物")
            return
        }

        // 请求取出
        GetMVMgr().ReqData(this.Window(), RanchMsg.RM_TakeOutReq, this.ranchIndex)
    }

    /**
     * 选中宠物
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickPet(event: cc.Event, data: string) {
        console.log("onClickPet:选中宠物")

        // 数据模板
        let res = {
            carry: false
        }

        // 解析结果
        if (!Json2Tmp(res, data)) {
            console.error("onClickPet:解析自定义数据失败")
            return
        }

        // 目标节点
        let node = (<cc.Node>event.target)

        if (this.ranchItem) {
            // 隐藏背景
            this.switchEnable(this.ranchItem, false)
            // 清除宠物索引
            this.ranchIndex = -1
        }

        // 获取同级索引
        let index = node.getSiblingIndex()

        if (res.carry) {
            this.carryIndex = index
            this.updateArrowPos(index)
            return
        }

        // 记录信息
        this.ranchIndex = index
        this.ranchItem = node

        // 显示背景
        this.switchEnable(node, true)

        // 显示道具信息
        this.showPetInfo(true)
    }

    /**
     * 设置主战宠物
     */
    protected onClickSetMain() {
        // 切换主战宠物
        GetMVMgr().ReqData(this.Window(), RanchMsg.RM_SetMainReq, this.carryIndex)
    }

    /**
     * 关闭宠物信息
     */
    protected onClickCloseInfo() {
        this.showPetInfo(false)
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

        // 索引指向主战宠
        this.carryIndex = this.mainIndex

        // 加载列表项
        for (let i = 0; i < this.carryPets.length; i++) {
            // 创建列表项
            let item = this.createCarryItem(this.carryPets[i])

            // 放大主战宠物图标
            if (i == this.mainIndex) {
                item.scale = 1.2
            }

            // 添加到列表中
            this.nCarry.addChild(item)
        }

        // 更新箭头位置
        this.nArrow.active = true

        // 箭头移动到主战宠上
        this.updateArrowPos(this.mainIndex)
    }

    /**
     * 加载牧场列表
     * @param data 牧场数据
     */
    private loadRanchList(data: any) {
        // 数据模板
        let res = {
            list: [],
            space: 0
        }

        // 解析数据
        if (!Json2Tmp(res, data)) {
            console.error("loadRanchList:解析数据失败")
            return
        }

        // 记录信息
        this.ranchPets = res.list
        this.ranchSpace = res.space

        // 更新空间信息
        this.updateSpace()

        // 加载列表项
        for (let i = 0; i < this.ranchPets.length; i++) {
            // 创建列表项
            let item = this.createRanchItem(this.ranchPets[i])

            // 添加到列表中
            this.svRanch.content.addChild(item)
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
            index: 0
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

        // 索引前移
        if (res.index < this.mainIndex) {
            this.mainIndex--
        }

        // 移除指定携带宠物
        let pet = this.carryPets.splice(res.index, 1)[0]
        this.nCarry.children[res.index].destroy()

        // 放入位置
        let pos = this.getPos(pet, false)

        // 放入牧场
        this.ranchPets.splice(pos, 0, pet)

        // 创建列表项
        let item = this.createRanchItem(pet)

        // 添加到列表中
        this.svRanch.content.insertChild(item, pos)

        // 索引指向主战宠
        this.carryIndex = this.mainIndex

        // 箭头位置回到主战宠
        this.updateArrowPos(this.mainIndex)
    }

    /**
     * 取出结果
     * @param data 结果信息
     */
    private takeOutResult(data: any) {
        // 结果模板
        let res = {
            err: "",
            index: 0
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

        // 移除指定牧场宠物
        let pet = this.ranchPets.splice(res.index, 1)[0]
        this.svRanch.content.children[res.index].destroy()

        // 放入位置
        let pos = this.getPos(pet, true)

        // 索引后移
        if (pet.Growth > this.carryPets[this.mainIndex].Growth) {
            this.mainIndex++
        }

        // 放入携带
        this.carryPets.splice(pos, 0, pet)

        // 创建列表项
        let item = this.createCarryItem(pet)

        // 添加到列表中
        this.nCarry.insertChild(item, pos)

        // 移除节点记录
        this.ranchItem = null

        // 携带索引指向主战宠
        this.carryIndex = this.mainIndex

        // 清除牧场索引
        this.ranchIndex = -1

        // 箭头位置回到主战宠
        this.updateArrowPos(this.mainIndex)
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
            this.nCarry.children[i].scale = res.index == i ? 1.2 : 1
        }

        this.mainIndex = res.index
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

        // 构造数据
        let json = {
            carry: true // 是否携带
        }

        // 绑定按钮事件
        this.bindClickEvent(item, "onClickPet", JSON.stringify(json))

        return item
    }

    /**
     * 创建牧场列表项
     * @param data 列表项信息
     * @returns 列表项节点
     */
    private createRanchItem(data: PetData): cc.Node {
        // 实例化节点
        let item = cc.instantiate(this.pRanchItem)

        // 设置列表项信息
        this.setItemInfo(item, data)

        // 构造数据
        let json = {
            carry: false // 是否携带
        }

        // 绑定按钮事件
        this.bindClickEvent(item, "onClickPet", JSON.stringify(json))

        return item
    }

    /**
     * 设置列表项信息
     * @param node 列表项节点
     * @param data 列表项信息
     */
    private setItemInfo(node: cc.Node, data: PetData) {
        // 宠物名
        node.getChildByName("label_name").getComponent(cc.Label).string = data.Name
        // 系别
        node.getChildByName("label_dept").getComponent(cc.Label).string = ConvertDept(data.Dept)
        // 等级
        node.getChildByName("label_level").getComponent(cc.Label).string = "LV " + data.Level.toString()
    }

    /**
     * 获取宠物放入位置
     * @param pet 宠物信息
     * @param carry 是否携带
     * @returns 放入位置
     */
    private getPos(pet: PetData, carry: boolean): number {
        // 宠物列表
        let list = carry ? this.carryPets : this.ranchPets

        // 计算位置
        for (let i = 0; i < list.length; i++) {
            if (pet.Growth > list[i].Growth) {
                return i
            }
        }

        return list.length
    }

    /**
     * 更新箭头位置
     * @param index 箭头位置索引
     */
    private updateArrowPos(index: number) {
        // 更新布局
        this.nCarry.getComponent(cc.Layout).updateLayout()

        // 计算箭头位置
        let wArrow = this.nArrow.convertToWorldSpaceAR(cc.v2())
        this.nArrow.x += this.carryPos[index] - wArrow.x
    }

    /**
     * 更新空间信息
     */
    private updateSpace() {
        this.lRanch.string = "牧场宠物数量：" + this.ranchPets.length + "/" + this.ranchSpace
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
     */
    private showPetInfo(state: boolean) {
        this.nInfo.active = state
        if (!state) {
            return
        }

        // 宠物信息
        let pet = this.ranchPets[this.ranchIndex]
        // 宠物属性
        let attr = pet.GetLevelAttr()

        // 宠物名
        this.nInfo.getChildByName("label_name").getComponent(cc.Label).string = pet.Name
        // 五行
        this.nInfo.getChildByName("label_dept").getComponent(cc.Label).string = "五行：" + ConvertDept(pet.Dept)
        // 生命
        this.nInfo.getChildByName("label_hp").getComponent(cc.Label).string = "生命：" + attr.HP.toString()
        // 魔法
        this.nInfo.getChildByName("label_mp").getComponent(cc.Label).string = "魔法：" + attr.MP.toString()
        // 攻击
        this.nInfo.getChildByName("label_atk").getComponent(cc.Label).string = "攻击：" + attr.Atk.toString()
        // 防御
        this.nInfo.getChildByName("label_def").getComponent(cc.Label).string = "防御：" + attr.Def.toString()
        // 命中
        this.nInfo.getChildByName("label_hit").getComponent(cc.Label).string = "命中：" + attr.Hit.toString()
        // 闪避
        this.nInfo.getChildByName("label_dod").getComponent(cc.Label).string = "闪避：" + attr.Dod.toString()
        // 速度
        this.nInfo.getChildByName("label_spd").getComponent(cc.Label).string = "速度：" + attr.Spd.toString()
        // 成长
        this.nInfo.getChildByName("label_growth").getComponent(cc.Label).string = "成长：" + KeepDecimal(pet.Growth, 1).toString()
        // 等级
        this.nInfo.getChildByName("label_level").getComponent(cc.Label).string = "等级：" + pet.Level.toString()
    }

    /**
     * 清理数据
     */
    private clean() {
        this.ranchPets = []
        this.carryPets = []
        this.ranchIndex = -1
        this.carryIndex = -1
        this.ranchItem = null
        this.mainIndex = -1
        this.ranchSpace = 0

        // 关闭宠物信息面板
        this.showPetInfo(false)
    }
}