import { IView } from "../base/view"
import { EffectType } from "../data/common_d"
import { PetData, PetDept, PetNode } from "../data/pet_d"
import { PropDataEx, PropType } from "../data/prop_d"
import { GetPetLib } from "../lib/pet_l"
import { GetPropLib } from "../lib/prop_l"
import { GetMVMgr } from "../mv/mvmgr"
import { ContainerMsg, TempleMsg } from "../mv/mvmsg"
import { UIWindow } from "../ui/window/uiwindow"
import { Json2Tmp } from "../util/json"
import { KeepDecimal } from "../util/math"

/**
 * ccc内置装饰器
 */
const { ccclass, property } = cc._decorator

/**
 * 宠物神殿
 * @extends UIWindow
 * @implements IView
 */
@ccclass
export default class Temple extends UIWindow implements IView {
    @property(cc.Node)
    private nEvolve: cc.Node = null // 进化面板
    @property(cc.Node)
    private nSynthesis: cc.Node = null // 合成面板
    @property(cc.Node)
    private nNirvana: cc.Node = null // 转生面板
    @property(cc.ScrollView)
    private svList: cc.ScrollView = null // 下拉列表
    @property(cc.Prefab)
    private pListItem: cc.Prefab = null // 下拉列表项
    @property(cc.Node)
    private nCarry: cc.Node = null // 携带列表
    @property(cc.Prefab)
    private pCarryItem: cc.Prefab = null // 携带预制体

    private carryPets: PetData[] = [] // 携带宠物列表
    private props: { [id: number]: PropDataEx } = {} // 养成类道具
    private curIndex: number = 0 // 当前宠物索引
    private curPannel: number = 0 // 当前面板
    private curNode: cc.Node = null // 当前目标节点
    private master: number = -1 // 主宠索引
    private slave: number = -1 // 副宠索引
    private assist: number = -1 // 协助索引
    private defend: number = 0 // 保护类道具ID
    private addition: number = 0 // 加成类道具ID

    /**
     * 获取窗口名
     * @returns 窗口名
     */
    public Window(): string {
        return "temple"
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
            // 养成道具列表
            case TempleMsg.TM_PropListRes:
                this.props = data
                break
            // 进化结果
            case TempleMsg.TM_PetEvolveRes:
                this.evolveResult(<PetData>data)
                break
            // 合成结果
            case TempleMsg.TM_PetSynthesisRes:
                this.synthesisResult(<PetData>data)
                break
            // 转生结果
            case TempleMsg.TM_PetNirvanaRes:
                this.nirvanaResult(<PetData>data)
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
        // 清理数据
        this.clean()
    }

    /**
     * 启动通知
     * @param args 启动参数
     */
    protected startUp(...args: any[]): void {
        // 切换到进化面板
        this.onClickSwitchTab(null, pannelType.PT_Evolve.toString())
        cc.find("togglecontainer_menu/toggle_evolve", this.node).getComponent(cc.Toggle).check()

        // 构造请求数据
        let req = {
            sType: PropType.PT_Synthetic,
            nType: PropType.PT_Nirvana
        }

        // 获取养成类列表
        GetMVMgr().ReqData(this.Window(), TempleMsg.TM_PropListReq, req)
    }

    /**
     * 点击标签切换
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickSwitchTab(_: cc.Event, data: string) {
        // 面板类型
        let type = parseInt(data)
        if (!type) {
            console.error("onClickSwitch:类型无效")
            return
        }

        // 切换面板
        this.switchPannel(type)
    }

    /**
     * 点击切换宠物
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickPet(event: cc.Event, _: string) {
        // 目标节点
        let node = (<cc.Node>event.target)

        // 获取同级索引
        let index = node.getSiblingIndex()

        // 记录当前宠物
        this.curIndex = index

        // 缩放宠物图标
        for (let i = 0; i < this.nCarry.childrenCount; i++) {
            this.nCarry.children[i].scale = index == i ? 1.1 : 1
        }

        // 加载进化信息
        this.loadEvolveNode(this.carryPets[index].Node)
    }

    /**
     * 点击宠物列表
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickPetList(event: cc.Event, data: string) {
        // 列表类型
        let type = parseInt(data)
        if (!type) {
            console.error("onClickPetList:列表类型无效")
            return
        }

        // 清空列表
        for (let i = 0; i < this.svList.content.childrenCount; i++) {
            this.svList.content.children[i].destroy()
        }

        // 目标节点
        this.curNode = (<cc.Node>event.target)

        // 动态设置列表位置
        this.setListPos(this.curNode)

        // 加载宠物列表
        this.loadPetList(type)
    }

    /**
     * 选择宠物
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickChoosePet(_: cc.Event, data: string) {
        // 自定义数据模板
        let tmp = {
            index: -1,
            type: 0,
            name: ""
        }

        // 解析数据
        if (!Json2Tmp(tmp, data)) {
            console.error("onClickChoosePet:解析自定义数据失败")
            return
        }

        // 校验数据
        if (tmp.index < 0 || tmp.type == 0) {
            console.error("onClickChoosePet:自定义数据无效")
            return
        }

        // 记录索引
        switch (tmp.type) {
            case listType.LT_Master:
                this.master = tmp.index
                break
            case listType.LT_Slave:
                this.slave = tmp.index
                break
            case listType.LT_Assist:
                this.assist = tmp.index
                break
            default:
                console.error("onClickChoosePet:列表类型无效")
                return
        }

        // 显示选中的宠物名称
        cc.find("sprite_background/label_name", this.curNode).getComponent(cc.Label).string = tmp.name

        // 关闭列表
        this.onClickCloseList()
    }

    /**
     * 点击道具列表
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickPropList(event: cc.Event, data: string) {
        // 列表类型
        let type = parseInt(data)
        if (!type) {
            console.error("onClickPropList:列表类型无效")
            return
        }

        // 清空列表
        for (let i = 0; i < this.svList.content.childrenCount; i++) {
            this.svList.content.children[i].destroy()
        }

        // 目标节点
        this.curNode = (<cc.Node>event.target)

        // 动态设置列表位置
        this.setListPos(this.curNode)

        // 加载道具列表
        this.loadPropList(type)
    }

    /**
     * 选择道具
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickChooseProp(_: cc.Event, data: string) {
        // 自定义数据模板
        let tmp = {
            id: 0,
            type: 0,
            name: ""
        }

        // 解析数据
        if (!Json2Tmp(tmp, data)) {
            console.error("onClickChooseProp:解析自定义数据失败")
            return
        }

        // 校验数据
        if (tmp.type == 0) {
            console.error("onClickChooseProp:自定义数据无效")
            return
        }

        // 记录道具ID
        if (tmp.type == EffectType.ET_Defend) {
            this.defend = tmp.id
        } else {
            this.addition = tmp.id
        }

        // 显示选中的道具名称
        cc.find("sprite_background/label_name", this.curNode).getComponent(cc.Label).string = tmp.name

        // 关闭列表
        this.onClickCloseList()
    }

    /**
     * 关闭列表
     */
    protected onClickCloseList() {
        this.svList.node.active = false
    }

    /**
     * 点击进化
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickEvolve(_: cc.Event, data: string) {
        // N:按钮自定义数据注意配合填写(A/B)

        // 构造请求数据
        let req = {
            id: this.carryPets[this.curIndex].ID,
            index: this.curIndex,
            low: data == "A" ? true : false
        }

        // 请求宠物进化
        GetMVMgr().ReqData(this.Window(), TempleMsg.TM_PetEvolveReq, req)
    }

    /**
     * 点击合成
     */
    protected onClickSynthesis() {
        // 校验参数
        if (this.master < 0 || this.slave < 0) {
            console.error("onClickSynthesis:参数无效")
            return
        }

        // 校验索引
        if (this.master == this.slave) {
            console.error("onClickSynthesis:宠物索引相同")
            return
        }

        // 构造请求数据
        let req = {
            master: this.master,
            slave: this.slave,
            defend: this.defend,
            addition: this.addition
        }

        // 请求宠物合成
        GetMVMgr().ReqData(this.Window(), TempleMsg.TM_PetSynthesisReq, req)
    }

    /**
     * 点击转生
     */
    protected onClickNirvana() {
        // 校验参数
        if (this.master < 0 || this.slave < 0 || this.assist < 0) {
            console.error("onClickNirvana:参数无效")
            return
        }

        // 校验索引
        if (this.master == this.slave || this.slave == this.assist || this.master == this.assist) {
            console.error("onClickNirvana:宠物索引相同")
            return
        }

        // 构造请求数据
        let req = {
            master: this.master,
            slave: this.slave,
            assist: this.assist,
            defend: this.defend,
            addition: this.addition
        }

        console.log(req)

        // 请求宠物转生
        GetMVMgr().ReqData(this.Window(), TempleMsg.TM_PetNirvanaReq, req)
    }

    // === 私有方法处理 ===

    /**
     * 切换面板
     * @param type 面板类型
     */
    private switchPannel(type: number) {
        this.nEvolve.active = type == pannelType.PT_Evolve
        this.nSynthesis.active = type == pannelType.PT_Synthesis
        this.nNirvana.active = type == pannelType.PT_Nirvana

        // 记录当前面板
        this.curPannel = type

        // 重置信息
        this.reset()
        this.resetLabel(true)
        this.resetLabel(false)

        // 获取携带宠物列表
        GetMVMgr().ReqData(this.Window(), ContainerMsg.CM_CarryReq, null)
    }

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
        this.curIndex = res.main

        // 非进化面板
        if (this.curPannel != pannelType.PT_Evolve) {
            return
        }

        // 加载列表项
        for (let i = 0; i < this.carryPets.length; i++) {
            // 创建列表项
            let item = this.createCarryItem(this.carryPets[i])

            // 放大主战宠物图标
            if (i == this.curIndex) {
                item.scale = 1.1
            }

            // 添加到列表中
            this.nCarry.addChild(item)
        }

        // 加载进化信息
        this.loadEvolveNode(this.carryPets[this.curIndex].Node)
    }

    /**
     * 加载宠物进化节点信息
     * @param node 进化节点信息
     */
    private loadEvolveNode(node: PetNode) {
        // 获取节点
        let nA = this.nEvolve.getChildByName("node_a")
        let nB = this.nEvolve.getChildByName("node_b")

        // 显示进化信息
        this.showEvolveInfo(nA, node, true)
        this.showEvolveInfo(nB, node, false)
    }

    /**
     * 宠物进化结果
     * @param data 进化后宠物信息
     */
    private evolveResult(data: PetData) {
        if (!data) {
            return
        }

        // 重置信息
        this.carryPets[this.curIndex] = data

        // 更新宠物信息
        let item = this.nCarry.children[this.curIndex]

        item.getChildByName("label_name").getComponent(cc.Label).string = data.Name
        item.getChildByName("label_level").getComponent(cc.Label).string = "LV " + data.Level.toString()
        item.getChildByName("label_growth").getComponent(cc.Label).string = "成长 " + KeepDecimal(data.Growth, 1).toString()

        // 加载进化信息
        this.loadEvolveNode(data.Node)
    }

    /**
    * 宠物合成结果
    * @param data 合成后宠物信息
    */
    private synthesisResult(data: PetData) {
        if (!data) {
            return
        }

        // 重置信息
        this.carryPets[this.master] = data

        // 重置信息
        this.reset()
        this.resetLabel(true)
    }

    /**
    * 宠物转生结果
    * @param data 转生后宠物信息
    */
    private nirvanaResult(data: PetData) {
        if (!data) {
            return
        }

        // 重置信息
        this.carryPets[this.master] = data

        // 重置信息
        this.reset()
        this.resetLabel(false)
    }

    /**
     * 加载宠物列表
     * @param type 列表类型
     */
    private loadPetList(type: number) {
        let pets: { [index: number]: PetData } = {}

        // 合成
        if (this.curPannel == pannelType.PT_Synthesis) {
            // 过滤神宠,过滤40级以下
            pets = this.filterPets(false)
        }

        // 转生
        if (this.curPannel == pannelType.PT_Nirvana) {
            // 过滤非神,过滤60级以下
            pets = this.filterPets(true)
        }

        // 没有符合的宠物
        if (Object.keys(pets).length == 0) {
            // 插入一个空的列表项
            let item = cc.instantiate(this.pListItem)
            this.svList.content.addChild(item)

            // 显示名称
            item.getChildByName("label_name").getComponent(cc.Label).string = "请先提升等级"
            return
        }

        for (let k in pets) {
            let item = cc.instantiate(this.pListItem)
            this.svList.content.addChild(item)

            // 显示名称
            item.getChildByName("label_name").getComponent(cc.Label).string = pets[k].Name

            // 构造自定义数据
            let json = {
                index: parseInt(k),
                type: type,
                name: pets[k].Name
            }

            // 绑定按钮事件
            this.bindClickEvent(item, "onClickChoosePet", JSON.stringify(json))
        }
    }

    /**
     * 加载道具列表
     * @param data 效果类型
     */
    private loadPropList(type: number) {
        // 没有符合的道具
        if (Object.keys(this.props).length == 0) {
            // 插入一个空的列表项
            let item = cc.instantiate(this.pListItem)
            this.svList.content.addChild(item)

            // 显示名称
            item.getChildByName("label_name").getComponent(cc.Label).string = "请先获取道具"
            return
        }

        for (let k in this.props) {
            // 类型不匹配
            if (!this.matchType(this.props[k].ID, type)) {
                continue
            }

            let item = cc.instantiate(this.pListItem)
            this.svList.content.addChild(item)

            // 显示名称
            item.getChildByName("label_name").getComponent(cc.Label).string = this.props[k].Data.Name

            // 构造自定义数据
            let json = {
                id: parseInt(k),
                type: type,
                name: this.props[k].Data.Name
            }

            // 绑定按钮事件
            this.bindClickEvent(item, "onClickChooseProp", JSON.stringify(json))
        }
    }

    /**
     * 过滤宠物
     * @param deity 是否神系
     * @returns 宠物列表
     */
    private filterPets(deity: boolean): { [index: number]: PetData } {
        let pets: { [index: number]: PetData } = []
        for (let i = 0; i < this.carryPets.length; i++) {
            let pet = this.carryPets[i]

            // 神系
            if (deity && pet.Dept == PetDept.PD_Deity && pet.Level >= 60) {
                pets[i] = pet
            }

            // 非神系
            if (!deity && pet.Dept < PetDept.PD_Deity && pet.Level >= 40) {
                pets[i] = pet
            }
        }

        return pets
    }

    /**
     * 效果类型匹配
     * @param id 道具ID
     * @param effect 效果类型
     * @returns 是否匹配
     */
    private matchType(id: number, effect: number): boolean {
        if (this.curPannel == pannelType.PT_Synthesis) {
            // 保护类(0x50000-0x57fff)
            if (effect == EffectType.ET_Defend) {
                return (id >> 15) == 0xa
            }

            // 加成类(0x58000-0x5ffff)
            return (id >> 15) == 0xb
        }

        // 保护类(0x60000-0x67fff)
        if (effect == EffectType.ET_Defend) {
            return (id >> 15) == 0xc
        }

        // 加成类(0x68000-0x6ffff)
        return (id >> 15) == 0xd
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
     * 显示进化信息
     * @param root 根节点
     * @param node 进化节点信息
     * @param low 是否低级进化(线路A低级,线路B高级)
     */
    private showEvolveInfo(root: cc.Node, node: PetNode, low: boolean) {
        // 获取信息
        let id = low ? node.AID : node.BID
        let level = low ? node.ALevel : node.BLevel
        let prop = low ? node.AProp : node.BProp
        let name = id ? GetPetLib().GetPet(id).Name : this.carryPets[this.curIndex].Name

        // 进化所需等级
        root.getChildByName("label_level").getComponent(cc.Label).string = "进化所需等级：" + level.toString()
        // 当前等级
        root.getChildByName("label_curlevel").getComponent(cc.Label).string = "当前等级：" + this.carryPets[this.curIndex].Level.toString()
        // 进化所需金币
        root.getChildByName("label_gold").getComponent(cc.Label).string = "进化所需金币：0"
        // 进化所需材料
        root.getChildByName("label_prop").getComponent(cc.Label).string = "进化所需材料：" + GetPropLib().GetPropName([prop])[0]
        // 进化后宠物
        root.getChildByName("label_target").getComponent(cc.Label).string = "进化后宠物：" + name
        // 当前成长值
        root.getChildByName("label_growth").getComponent(cc.Label).string = "当前成长值：" + KeepDecimal(this.carryPets[this.curIndex].Growth, 1).toString()
    }

    /**
     * 设置列表位置
     * @param node 目标位置
     */
    private setListPos(node: cc.Node) {
        let wNode = node.convertToWorldSpaceAR(cc.v2())
        let wList = this.svList.node.convertToWorldSpaceAR(cc.v2())

        // 动态设置位置
        this.svList.node.x += wNode.x - wList.x
        this.svList.node.y += wNode.y - wList.y - (node.height / 2)
        this.svList.node.active = true
    }

    /**
     * 重置信息
     */
    private reset() {
        // 清空携带列表
        for (let i = 0; i < this.nCarry.childrenCount; i++) {
            this.nCarry.children[i].destroy()
        }

        this.master = -1
        this.slave = -1
        this.assist = -1
        this.defend = 0
        this.addition = 0
    }

    /**
     * 重置文本
     * @param syn 是否合成
     */
    private resetLabel(syn: boolean) {
        let node = syn ? this.nSynthesis : this.nNirvana

        cc.find("button_master/sprite_background/label_name", node).getComponent(cc.Label).string = "请选择主宠物∨"
        cc.find("button_slave/sprite_background/label_name", node).getComponent(cc.Label).string = "请选择副宠物∨"
        cc.find("button_defend/sprite_background/label_name", node).getComponent(cc.Label).string = "选择守护道具∨"
        cc.find("button_addition/sprite_background/label_name", node).getComponent(cc.Label).string = "选择加成道具∨"

        if (!syn) {
            cc.find("button_assist/sprite_background/label_name", node).getComponent(cc.Label).string = "请选择涅槃兽∨"
        }
    }

    /**
     * 清理数据
     */
    private clean() {
        this.carryPets = []
        this.props = {}
        this.curIndex = 0
        this.curPannel = 0

        this.reset()
        this.resetLabel(true)
        this.resetLabel(false)
    }
}

// === === ===

/**
 * 面板类型
 */
enum pannelType {
    PT_Evolve = 1, // 进化
    PT_Synthesis = 2, // 合成
    PT_Nirvana = 3, // 转生
}

/**
 * 列表类型
 */
enum listType {
    LT_Master = 1, // 主宠
    LT_Slave = 2, // 副宠
    LT_Assist = 3, // 协助
}