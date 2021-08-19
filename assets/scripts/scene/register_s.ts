import { PetDept } from "../data/pet_d"
import { GetMainMgr } from "../module/mainmgr"
import { UIBase } from "../ui/uibase/uibase"

const { ccclass, property } = cc._decorator

/**
 * 注册场景
 * @extends UIBase
 */
@ccclass
export default class RegisterScene extends UIBase {
    @property(cc.EditBox)
    private editBox: cc.EditBox = null // 角色名输入框
    @property(cc.Label)
    private lPet: cc.Label = null // 宠物文本

    private bound: boolean = false // 是否已绑定
    private petID: number = 0 // 宠物ID

    /**
     * 选择按钮事件
     */
    protected onClickChoose() {
        // 显示选择宠物窗口
        this.asyncShowWindow("prefabs/register/choosepet", "choosepet", this.node.getChildByName("node_window"), this.bindPet.bind(this))
    }

    /**
     * 确认按钮事件
     */
    protected onClickOK() {
        // 校验角色名
        if (this.editBox.string.length == 0) {
            console.error("onClickOK:角色名无效")
            return
        }

        // 校验宠物
        if (!this.bound) {
            console.error("onClickOK:未选择宠物")
            return
        }

        // 用户注册
        let errReg = GetMainMgr().Register(this.editBox.string, this.petID)
        if (errReg) {
            console.error("onClickOK:注册失败|" + errReg)
            return
        }

        // 进入游戏场景
        cc.director.loadScene("main")
    }

    /**
     * 绑定宠物
     * @param id 宠物ID
     * @param name 宠物名
     */
    private bindPet(id: number, name: string) {
        // 更新文本
        this.lPet.string = "宠物: " + name

        // 记录信息
        this.bound = true
        this.petID = id
    }
}