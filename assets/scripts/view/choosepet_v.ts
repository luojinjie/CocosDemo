import { IView } from "../base/view"
import { UIWindow } from "../ui/window/uiwindow"

/**
 * ccc内置装饰器
 */
const { ccclass, property } = cc._decorator

/**
 * 选择宠物
 * @extends UIWindow
 * @implements IView
 */
@ccclass
export default class ChoosePetView extends UIWindow implements IView {
    private index: number = 0 // 系别索引

    /**
     * 获取窗口名
     * @returns 窗口名
     */
    public Window(): string {
        return "choosepet"
    }

    /**
     * 响应通知(模型响应)
     * @param msg 消息类型
     * @param data 响应数据
     */
    public ResNotify(msg: string, data: any) {
    }

    /**
     * ccc加载
     */
    protected onLoad() {
        // 父类加载
        super.onLoad()
    }

    /**
     * 启动通知
     * @param args 启动参数
     */
    protected startUp(...args: any[]): void { }

    /**
     * 选择宠物
     * @param event 点击事件
     * @param data 自定义数据
     */
    protected onClickChoose(_: cc.Event, data: string) {
        // 记录索引
        this.index = parseInt(data)

        this.onClickBack()
    }

    /**
     * 返回创建
     */
    protected onClickBack() {
        // 获取宠物信息
        let info = petInfo[this.index]

        // 回调宠物信息
        this.selfClose(info.id, info.name)
    }
}

/**
 * 宠物信息
 */
const petInfo = [
    { id: 0x10001, name: "金波姆" },
    { id: 0x20001, name: "绿波姆" },
    { id: 0x30001, name: "水波姆" },
    { id: 0x40001, name: "火波姆" },
    { id: 0x50001, name: "土波姆" },
]