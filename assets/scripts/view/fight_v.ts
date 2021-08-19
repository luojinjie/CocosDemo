import { IView } from "../base/view";
import { CatchData, FightBase, FightData, HurtData, OperFlag, OperType, TreatmentData } from './../data/fight_d';
import { PropDataEx, PropType } from "../data/prop_d";
import { GetPropLib } from "../lib/prop_l";
import { GetMVMgr } from "../mv/mvmgr";
import { FightMsg } from "../mv/mvmsg";
import { UIWindow } from "../ui/window/uiwindow";
import { GetNextExp } from "../util/exp";
import { Json2Tmp } from "../util/json";

/**
 * ccc内置装饰器
 */
const { ccclass, property } = cc._decorator

/**
 * 战斗视图
 * @extends UIWindow 
 * @implements IView
 */
@ccclass
export default class FightView extends UIWindow implements IView {
    @property(cc.Node)
    private nPet: cc.Node = null // 宠物节点
    @property(cc.Node)
    private nEnemy: cc.Node = null // 敌人节点
    @property(cc.Node)
    private nWaitLoad: cc.Node = null // 等待加载节点
    @property(cc.Node)
    private nWaitOper: cc.Node = null // 等待操作节点
    @property(cc.Node)
    private nMenu: cc.Node = null // 菜单节点
    @property(cc.Node)
    private nOper: cc.Node = null // 操作信息节点
    @property(cc.Node)
    private nPokeball: cc.Node = null // 精灵球列表节点
    @property(cc.Node)
    private nEnd: cc.Node = null // 战斗结束节点

    private isAuto: boolean = false // 自动开始下一场战斗
    private skillID: number = 0 // 自动释放的技能ID
    private duration: number = 0 // 倒计时时长
    private pet: FightBase = null // 宠物战斗信息
    private enemy: FightBase = null // 敌人战斗信息
    private fightData: FightData = null // 战斗信息
    private pokeballs: PropDataEx[] = [] // 精灵球列表

    /**
     * 获取窗口名
     * @returns 窗口名
     */
    public Window(): string {
        return "fight"
    }

    /**
     * 响应通知(模型响应)
     * @param msg 消息类型
     * @param data 响应数据
     */
    public ResNotify(msg: string, data: any) {
        switch (msg) {
            // 基础战斗信息
            case FightMsg.FM_GetFightBaseRes:
                this.loadFightBase(data)
                break
            // 操作结果
            case FightMsg.FM_UserOperRes:
                this.userOperResult(data)
                break
            // 精灵球道具列表
            case FightMsg.FM_PropListRes:
                this.loadPokeball(data)
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
        // 停止计时器
        this.unschedule(this.operTimer)

        // 清理数据
        this.clean()
    }

    /**
     * 启动通知
     * @param args 启动参数
     */
    protected startUp(...args: any[]): void {
        // 获取战斗信息
        this.getFightBase()
    }

    /**
     * 设置自动
     */
    protected onClickSetAuto() {
        this.isAuto = !this.isAuto
    }

    /**
     * 设置技能
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickSetSkill(_: cc.Event, data: string) {
        this.skillID = parseInt(data)
    }

    /**
     * 使用技能
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickUseSkill(_: cc.Event, data: string) {
        // 构造请求数据
        let req = {
            type: OperType.OT_Skill, // 技能操作
            skill: parseInt(data) // 技能ID
        }

        // 请求捕捉
        GetMVMgr().ReqData(this.Window(), FightMsg.FM_UserOperReq, req)

        // 隐藏操作界面
        this.toggleMenu(false)
    }

    /**
     * 使用药水
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickUseMedicine(_: cc.Event, data: string) {
        // 构造请求数据
        let req = {
            type: OperType.OT_Medicine, // 药水操作
            prop: parseInt(data) // 道具ID
        }

        // 请求捕捉
        GetMVMgr().ReqData(this.Window(), FightMsg.FM_UserOperReq, req)

        // 隐藏操作界面
        this.toggleMenu(false)
    }

    /**
     * 捕捉宠物
     */
    protected onClickCatch() {
        // 显示精灵球列表
        this.nPokeball.active = true
        // 隐藏子节点
        for (let i = 0; i < this.nPokeball.childrenCount - 1; i++) {
            this.nPokeball.children[i].active = false
        }

        // 获取精灵球列表
        GetMVMgr().ReqData(this.Window(), FightMsg.FM_PropListReq, PropType.PT_Pokeball)
    }

    /**
     * 点击精灵球捕捉
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickPokeball(_: cc.Event, data: string) {
        // 构造请求数据
        let req = {
            type: OperType.OT_Catch, // 捕捉操作
            prop: this.pokeballs[parseInt(data)].ID // 道具ID
        }

        // 请求捕捉
        GetMVMgr().ReqData(this.Window(), FightMsg.FM_UserOperReq, req)

        // 隐藏操作界面
        this.toggleMenu(false)
        this.onClickCloseList()
    }

    /**
     * 逃跑
     */
    protected onClickEscape() {
        // 停止计时器
        this.unschedule(this.operTimer)

        // 隐藏操作界面
        this.toggleMenu(false)

        // 重新获取基础战斗信息
        this.getFightBase()
    }

    /**
     * 继续战斗
     */
    protected onClickContinue() {
        // 关闭结束面板
        this.nEnd.active = false
        this.nEnd.getChildByName("node_lose").active = false
        this.nEnd.getChildByName("node_win").active = false

        // 获取基础战斗信息
        this.getFightBase()
    }

    /**
     * 返回城镇
     */
    protected onClickGoCity() {
        // 关闭结束面板
        this.nEnd.active = false
        this.nEnd.getChildByName("node_lose").active = false
        this.nEnd.getChildByName("node_win").active = false

        // 关闭战斗界面
        this.selfClose()
    }

    /**
     * 关闭精灵球列表
     */
    protected onClickCloseList() {
        this.nPokeball.active = false
    }

    // === 私有方法处理 ===

    /**
     * 获取基础战斗信息
     */
    private getFightBase() {
        // 初始化倒计时时长
        this.duration = 3

        // 显示加载倒计时
        this.nWaitLoad.active = true
        this.nWaitLoad.getChildByName("label_wait").getComponent(cc.Label).string = this.duration.toString()

        // 启动倒计时
        this.schedule(this.loadTimer, 1)

        // 请求获取战斗信息
        GetMVMgr().ReqData(this.Window(), FightMsg.FM_GetFightBaseReq, null)
    }

    /**
     * 等待操作
     */
    private waitOper() {
        // 初始化倒计时时长
        this.duration = 5
        this.nWaitOper.getChildByName("label_time").getComponent(cc.Label).string = this.duration.toString()

        // 显示操作界面
        this.toggleMenu(true)

        // 启动倒计时
        this.schedule(this.operTimer, 1)
    }

    /**
     * 战斗结束
     */
    private fightEnd() {
        // 显示结束面板
        this.nEnd.active = true

        // 战斗失败
        if (!this.fightData.EndData) {
            // 显示失败
            this.nEnd.getChildByName("node_lose").active = true
            return
        }

        // 显示胜利
        let nWin = this.nEnd.getChildByName("node_win")
        nWin.active = true

        // 获取战利品列表
        let list = "无"
        if (this.fightData.EndData.Spoils.length != 0) {
            let names = GetPropLib().GetPropName(this.fightData.EndData.Spoils)
            list = names.join(",")
        }

        // 经验
        nWin.getChildByName("label_exp").getComponent(cc.Label).string = "获取经验: " + this.fightData.EndData.Exp.toString()
        // 金币
        nWin.getChildByName("label_gold").getComponent(cc.Label).string = "获取金币: " + this.fightData.EndData.Gold.toString()
        // 战利品
        cc.find("scrollview_spoil/mask_view/label_list", nWin).getComponent(cc.Label).string = list
    }

    /**
     * 加载倒计时
     */
    private loadTimer() {
        // 更新时间
        this.duration--

        // 倒计时结束
        if (this.duration <= 0) {
            // 未有战斗信息
            if (!this.pet || !this.enemy) {
                return
            }

            this.unschedule(this.loadTimer)
            this.waitOper()

            // 隐藏加载倒计时
            this.nWaitLoad.active = false

        }
        this.nWaitLoad.getChildByName("label_wait").getComponent(cc.Label).string = this.duration.toString()
    }

    /**
     * 操作倒计时
     */
    // 更新时间
    private operTimer() {
        // 更新时间
        this.duration--

        // 倒计时结束
        if (this.duration <= 0) {
            // 停止计时器
            this.unschedule(this.operTimer)

            // 超时自动使用技能
            this.onClickUseSkill(null, this.skillID.toString())
            return
        }

        this.nWaitOper.getChildByName("label_time").getComponent(cc.Label).string = this.duration.toString()
    }

    /**
     * 加载基础战斗信息
     * @param data 战斗信息
     */
    private loadFightBase(data: any) {
        // 信息模板
        let res = {
            user: new FightBase(),
            enemy: new FightBase()
        }

        // 解析结果
        if (!Json2Tmp(res, data)) {
            console.error("loadFightInfo:解析基础战斗信息失败")
            return
        }

        // 校验战斗信息
        if (!res.user || !res.enemy) {
            console.error("loadFightInfo:基础战斗信息无效")
            return
        }

        // 记录信息
        this.pet = res.user
        this.enemy = res.enemy

        // 显示基础信息
        this.showBase()
    }

    /**
     * 操作结果
     * @param data 战斗数据
     */
    private userOperResult(data: FightData) {
        // 操作异常
        if (!data) {
            // 显示操作界面
            this.toggleMenu(true)
            return
        }

        // 记录战斗信息
        this.fightData = data
        // 检查操作信息
        this.checkOper()
    }

    /**
     * 加载精灵球列表
     * @param data 道具列表
     */
    private loadPokeball(data: { [id: number]: PropDataEx }) {
        // 获取符合捕捉对象的精灵球
        let list: PropDataEx[] = []
        for (let k in data) {
            if (this.matchPet(data[k].Data.Script)) {
                list.push(data[k])
            }
        }

        // 记录列表
        this.pokeballs = list

        for (let i = 0; i < list.length; i++) {
            // 显示列表项
            let node = this.nPokeball.children[i]
            node.active = true

            // 名称
            cc.find("sprite_background/label_name", node).getComponent(cc.Label).string = list[i].Data.Name
        }
    }

    /**
     * 切换菜单状态
     * @param state 状态
     */
    private toggleMenu(state: boolean) {
        this.nMenu.active = state

        // 停止倒计时
        if (!state) {
            this.unschedule(this.operTimer)
        }
    }

    /**
     * 显示基础信息
     */
    private showBase() {
        // 名称
        this.nPet.getChildByName("label_pet").getComponent(cc.Label).string = this.pet.Name
        this.nEnemy.getChildByName("label_enemy").getComponent(cc.Label).string = this.enemy.Name + " LV " + this.enemy.Level.toString()

        // 等级
        this.nPet.getChildByName("label_level").getComponent(cc.Label).string = this.pet.Level.toString() + "级"

        // 更新战斗信息
        this.updateFight(this.pet, false)
        this.updateFight(this.enemy, true)
    }

    /**
     * 更新战斗信息
     * @param base 战斗信息
     * @param enemy 是否敌人
     */
    private updateFight(base: FightBase, enemy: boolean) {
        if (enemy) {
            // 生命
            this.nEnemy.getChildByName("label_hp").getComponent(cc.Label).string = base.HP.toString() + "/" + this.enemy.HP.toString()
            // 生命百分比
            cc.find("sprite_border1/progressbar_hp", this.nEnemy).getComponent(cc.ProgressBar).progress = base.HP / this.enemy.HP
            return
        }

        // 生命
        this.nPet.getChildByName("label_hp").getComponent(cc.Label).string = base.HP.toString() + "/" + this.pet.HP.toString()
        // 魔力
        this.nPet.getChildByName("label_mp").getComponent(cc.Label).string = base.MP.toString() + "/" + this.pet.MP.toString()
        // 经验
        this.nPet.getChildByName("label_exp").getComponent(cc.Label).string = base.Exp.toString() + "/" + GetNextExp(this.pet.Level) || "-"
        // 生命百分比
        cc.find("sprite_border1/progressbar_hp", this.nPet).getComponent(cc.ProgressBar).progress = base.HP / this.pet.HP
        // 魔力百分比
        cc.find("sprite_border1/progressbar_mp", this.nPet).getComponent(cc.ProgressBar).progress = base.MP / this.pet.MP
        // 经验百分比
        cc.find("sprite_border1/progressbar_exp", this.nPet).getComponent(cc.ProgressBar).progress = base.Exp / GetNextExp(this.pet.Level)
    }

    /**
     * 检查操作信息
     */
    private checkOper() {
        // 获取操作数据
        let oper = this.fightData.OperData.shift()
        if (!oper) {
            // 战斗未结束
            if (!this.fightData.IsEnd) {
                // 继续等待操作
                this.waitOper()
                return
            }

            // 战斗结束
            this.fightEnd()
            return
        }

        // 操作过程
        this.nWaitOper.getChildByName("label_time").getComponent(cc.Label).string = "PK"

        switch (oper.Type) {
            // 技能操作
            case OperType.OT_Skill:
                this.showSkillOper((<HurtData>oper))
                break;
            // 药水操作
            case OperType.OT_Medicine:
                this.showMedicineOper((<TreatmentData>oper))
                break;
            // 捕捉操作
            case OperType.OT_Catch:
                this.showCatchOper((<CatchData>oper))
                break;
        }

        // 更新敌人战斗信息
        if (oper.Flag == OperFlag.OF_User) {
            this.updateFight(this.fightData.Enemy, true)
            return
        }

        // 更新用户战斗信息
        this.updateFight(this.fightData.User, false)
    }

    /**
     * 显示技能操作
     * @param data 伤害信息
     */
    private showSkillOper(data: HurtData) {
        // 获取节点
        let defNode = data.Flag == OperFlag.OF_User ? this.nEnemy.getChildByName("sprite_enemy") : this.nPet.getChildByName("sprite_pet")
        let atkNode = data.Flag == OperFlag.OF_User ? this.nPet.getChildByName("sprite_pet") : this.nEnemy.getChildByName("sprite_enemy")
        // 偏移值
        let hurtOffset = data.Flag == OperFlag.OF_User ? -60 : 60
        let atkOffset = data.Flag == OperFlag.OF_User ? -100 : 100

        // 显示操作信息
        this.nOper.active = true

        // 计算显示位置
        let wAtkNode = atkNode.convertToWorldSpaceAR(cc.v2())
        let wDefNode = defNode.convertToWorldSpaceAR(cc.v2())
        let wOper = this.nOper.convertToWorldSpaceAR(cc.v2())
        this.nOper.x += wDefNode.x - wOper.x + hurtOffset
        atkNode.x = wDefNode.x - wAtkNode.x + atkOffset

        // 技能名
        let nName = this.nOper.getChildByName("label_name")
        nName.getComponent(cc.Label).string = data.Name
        nName.active = true

        // 基础伤害
        let nBase = this.nOper.getChildByName("label_base")
        nBase.getChildByName("label_val").getComponent(cc.Label).string = "-" + data.BaseHurt.toString()
        nBase.active = true

        // 吸血
        if (data.SuckBlood) {
            let nSuck = this.nOper.getChildByName("label_suck")
            nSuck.getChildByName("label_val").getComponent(cc.Label).string = "+" + data.SuckBlood.toString()
            nSuck.active = true
        }

        // 加深
        if (data.DeepenHurt) {
            let nDeepen = this.nOper.getChildByName("label_deepen")
            nDeepen.getChildByName("label_val").getComponent(cc.Label).string = "-" + data.DeepenHurt.toString()
            nDeepen.active = true
        }

        // 延迟关闭
        this.scheduleOnce(() => {
            // 还原位置
            atkNode.x = 0

            this.nOper.active = false
            for (let i = 0; i < this.nOper.childrenCount; i++) {
                this.nOper.children[i].active = false
            }

            // 检查下一个操作信息
            this.checkOper()
        }, 1.5)
    }

    /**
     * 显示药水操作
     * @param data 治疗信息
     */
    private showMedicineOper(data: TreatmentData) {
        let target = data.Flag == OperFlag.OF_User ? this.nPet.getChildByName("sprite_pet") : this.nEnemy.getChildByName("sprite_enemy")

        // 显示操作信息
        this.nOper.active = true

        // 计算显示位置
        let wTarget = target.convertToWorldSpaceAR(cc.v2())
        let wOper = this.nOper.convertToWorldSpaceAR(cc.v2())
        this.nOper.x += wTarget.x - wOper.x

        // 技能名
        let nName = this.nOper.getChildByName("label_name")
        nName.getComponent(cc.Label).string = data.Name
        nName.active = true

        // 回复
        if (data.Recovery) {
            let nRecovery = this.nOper.getChildByName("label_recovery")
            nRecovery.getChildByName("label_val").getComponent(cc.Label).string = "+" + data.Recovery.toString()
            nRecovery.active = true
        }

        // 延迟关闭
        this.scheduleOnce(() => {
            this.nOper.active = false
            for (let i = 0; i < this.nOper.childrenCount; i++) {
                this.nOper.children[i].active = false
            }

            // 检查下一个操作信息
            this.checkOper()
        }, 1.5)
    }

    /**
     * 显示捕捉操作
     * @param data 
     */
    private showCatchOper(data: CatchData) {
        if (data.Result) {
            // 停止计时器
            this.unschedule(this.operTimer)

            // 获取基础战斗信息
            this.getFightBase()

            return
        }

        // 检查下一个操作信息
        this.checkOper()
    }

    /**
     * 宠物匹配
     * @param json json数据
     * @returns 是否匹配
     */
    private matchPet(json: object): boolean {
        // 数据模版
        let tmp = {
            PID: 0, // 宠物ID
        }

        // 解析数据
        if (!Json2Tmp(tmp, json)) {
            console.error("matchPet:解析数据失败")
            return false
        }

        // 捕捉对象符合
        if (tmp.PID == this.enemy.ID) {
            return true
        }

        return false
    }

    /**
     * 清理数据
     */
    private clean() {
        this.isAuto = false
        this.skillID = 0
        this.duration = 0
        this.pet = null
        this.enemy = null
        this.fightData = null
        this.pokeballs = []

        // 关闭面板
        this.nEnd.active = false
        this.nPokeball.active = false
    }
}