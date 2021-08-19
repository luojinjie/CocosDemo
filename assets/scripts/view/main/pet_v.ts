import { IView } from "../../base/view"
import { PetData } from "../../data/pet_d"
import { GetMVMgr } from "../../mv/mvmgr"
import { ContainerMsg, PetMsg } from "../../mv/mvmsg"
import { UIBase } from "../../ui/uibase/uibase"
import { ConvertDept } from "../../util/convert"
import { GetNextExp } from "../../util/exp"
import { Json2Tmp } from "../../util/json"
import { KeepDecimal } from "../../util/math"

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
    private nCarry: cc.Node = null // 携带列表
    @property(cc.Prefab)
    private pCarryItem: cc.Prefab = null // 携带预制体
    @property(cc.Node)
    private nCarryTab: cc.Node = null // 携带页节点
    @property(cc.Node)
    private nAttrTab: cc.Node = null // 属性页节点
    @property(cc.Node)
    private nSkillTab: cc.Node = null // 技能页节点

    private carryPets: PetData[] = [] // 携带宠物列表
    private mainIndex: number = -1 // 主战索引
    private tab: number = 0 // 当前所在标签页

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
            case PetMsg.PM_SetMainRes:
                this.setMainResult(data)
                break
        }
    }

    /**
     * ccc加载
     */
    protected onLoad() {
        // 绑定视图
        GetMVMgr().BindView(vName, this)
    }

    /**
     * ccc激活
     */
    protected onEnable() {
        // 初始标签页
        this.tab = petTab.PT_Carry

        // 获取携带宠物列表
        GetMVMgr().ReqData(vName, ContainerMsg.CM_CarryReq, null)
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
     * 切换标签页
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickTab(_: cc.Event, data: string) {
        // 过滤相同标签页
        if (this.tab == parseInt(data)) {
            return
        }

        // 修改标签页
        this.tab = parseInt(data)

        this.nCarryTab.active = this.tab == petTab.PT_Carry
        this.nAttrTab.active = this.tab == petTab.PT_Attr
        this.nSkillTab.active = this.tab == petTab.PT_Skill
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
        GetMVMgr().ReqData(vName, PetMsg.PM_SetMainReq, index)
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

        // 加载宠物属性
        this.loadPetAttr()
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

        // 加载宠物属性
        this.loadPetAttr()
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
     * 加载宠物属性
     */
    private loadPetAttr() {
        // 宠物信息
        let pet = this.carryPets[this.mainIndex]
        // 宠物属性
        let attr = pet.GetLevelAttr()
        // 列表节点
        let list = this.nCarryTab.getChildByName("layout_carry")

        // 等级
        list.getChildByName("label_level").getComponent(cc.Label).string = "等级：" + pet.Level.toString()
        // 五行
        list.getChildByName("label_dept").getComponent(cc.Label).string = "五行：" + ConvertDept(pet.Dept)
        // 阶级
        list.getChildByName("label_stage").getComponent(cc.Label).string = "阶级：" + pet.Stage.toString()
        // 生命
        list.getChildByName("label_hp").getComponent(cc.Label).string = "生命：" + attr.HP.toString()
        // 魔法
        list.getChildByName("label_mp").getComponent(cc.Label).string = "魔法：" + attr.MP.toString()
        // 攻击
        list.getChildByName("label_atk").getComponent(cc.Label).string = "攻击：" + attr.Atk.toString()
        // 防御
        list.getChildByName("label_def").getComponent(cc.Label).string = "防御：" + attr.Def.toString()
        // 命中
        list.getChildByName("label_hit").getComponent(cc.Label).string = "命中：" + attr.Hit.toString()
        // 闪避
        list.getChildByName("label_dod").getComponent(cc.Label).string = "闪避：" + attr.Dod.toString()
        // 速度
        list.getChildByName("label_spd").getComponent(cc.Label).string = "速度：" + attr.Spd.toString()
        // 成长
        list.getChildByName("label_growth").getComponent(cc.Label).string = "成长：" + KeepDecimal(pet.Growth, 1).toString()

        // 更换节点
        list = this.nAttrTab.getChildByName("layout_attr")
        // 当前经验
        list.getChildByName("label_exp").getComponent(cc.Label).string = "当前经验：" + pet.Exp.toString()
        // 升级经验
        list.getChildByName("label_next").getComponent(cc.Label).string = "升级经验：" + GetNextExp(pet.Level).toString()
    }

    /**
     * 清理数据
     */
    private clean() {
        this.carryPets = []
        this.mainIndex = -1

        // 切换到携带页
        this.onClickTab(null, petTab.PT_Carry.toString())
    }
}

/**
 * 视图名
 */
const vName = "pet"

/**
 * 宠物资料标签
 */
const enum petTab {
    PT_Carry = 1, // 携带
    PT_Attr = 2, // 属性
    PT_Skill = 3 // 技能
}