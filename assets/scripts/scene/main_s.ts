import { GetPromptMgr } from "../module/prompt/promptmgr"
import { UIBase } from "../ui/uibase/uibase"
import { GetWinMgr } from "../ui/window/winmgr"

const { ccclass, property } = cc._decorator

/**
 * 主场景
 * @extends UIBase
 */
@ccclass
export default class MainScene extends UIBase {
    @property(cc.Node)
    private nPrompt: cc.Node = null // 提示框

    private nExplore: cc.Node = null // 野外节点
    private nCity: cc.Node = null // 城镇节点
    private nPet: cc.Node = null // 宠物节点
    private nSelf: cc.Node = null // 个人信息节点

    /**
     * ccc加载
     */
    protected onLoad() {
        // 加载main主体预制体
        cc.resources.loadDir("prefabs/main", cc.Prefab, (err: Error, ps: cc.Prefab[]) => {
            if (err) {
                console.error("onLoad:加载main主体预制体失败")
                return
            }

            // 容器
            let parent = this.node.getChildByName("node_main")

            for (let i = 0; i < ps.length; i++) {
                // 实例化节点
                let n = cc.instantiate(ps[i])

                // 绑定关联
                if (ps[i].name == "explore") {
                    this.nExplore = n
                } else if (ps[i].name == "city") {
                    this.nCity = n
                } else if (ps[i].name == "pet") {
                    this.nPet = n
                } else if (ps[i].name == "self") {
                    this.nSelf = n
                }

                parent.addChild(n)
            }

            // 初始打开中心城镇
            this.onClickPage(null, pageType.PT_City.toString())
        })

        // 绑定提示框
        GetPromptMgr().BindPrompt(this.nPrompt)
    }

    /**
     * 切换页面事件
     * @param event 点击事件
     * @param type 页面类型
     */
    protected onClickPage(_: cc.Event.EventTouch, type: string) {
        // 转换为number
        let t = parseInt(type)

        // 显示切换
        this.nExplore.active = t == pageType.PT_Explore
        this.nCity.active = t == pageType.PT_City
        this.nPet.active = t == pageType.PT_Pet
        // this.nSelf.active = t == pageType.PT_Self

        // 关闭所有窗口
        GetWinMgr().CloseAll()
    }

    /**
     * 打开背包
     */
    protected onClickPack() {
        this.asyncShowWindow("prefabs/backpack/backpack", "backpack", this.node.getChildByName("node_pack"), null)
    }
}

/**
 * 页面类型
 */
enum pageType {
    PT_Explore = 1, // 野外探险
    PT_City = 2, // 中心城镇
    PT_Pet = 3, // 宠物资料
    PT_Self = 4 // 个人信息
}