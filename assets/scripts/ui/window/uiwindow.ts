import { GetWinMgr } from "./winmgr"
import { UIBase } from "../uibase/uibase"

/**
 * UI窗口类
 * @extends UIBase
 */
export abstract class UIWindow extends UIBase {
    protected notity: (...args: any[]) => void = null // 关闭回调

    /* ccc加载 */
    protected onLoad() {
        // 绑定到窗口管理器
        GetWinMgr().Bind(this)

        // 绑定关闭按钮事件
        this.bindCloseEvent()
    }

    /** 
     * 显示窗口
     * @param cb 窗口关闭回调
     * @param begs 启动参数
     */
    protected show(cb: (...args: any[]) => void, ...begs: any[]) {
        // 绑定回调
        if (cb) {
            this.notity = cb
        }

        // 显示节点
        this.node.active = true
        this.node.opacity = 255

        // 启动通知
        this.startUp(...begs)
    }

    /**
     * 关闭窗口
     * @param ends 回调参数
     */
    protected close(...ends: any[]) {
        // 关闭回调
        if (this.notity) {
            this.notity(...ends)
        }

        // 隐藏节点
        this.node.active = false
    }

    /**
     * 内部回调关闭
     * @param ends 回调参数
     */
    protected selfClose(...ends: any[]) {
        GetWinMgr().CloseWindow(this.Window(), ...ends)
    }

    /**
     * 绑定关闭按钮事件
     */
    private bindCloseEvent() {
        // 获取绑定按钮
        let btnClose = this.node.getChildByName("button_close")
        if (!btnClose) {
            console.error("bindCloseEvent:窗口缺少关闭按钮")
            return
        }

        // 判断节点类型
        let btnComp = btnClose.getComponent(cc.Button)
        if (!btnComp || !btnComp.clickEvents) {
            console.error("bindCloseEvent:类型错误")
            return
        }

        // 构造监听对象
        let eh = new cc.Component.EventHandler()
        eh.target = this.node
        eh.component = this.getScriptName()
        eh.handler = "selfClose"

        // 添加事件
        btnComp.clickEvents.push(eh)
    }

    /**
     * 获取窗口名
     * @returns 窗口名
     */
    public abstract Window(): string

    /**
     * 启动通知
     * @param args 启动参数
     */
    protected abstract startUp(...args: any[]): void
}