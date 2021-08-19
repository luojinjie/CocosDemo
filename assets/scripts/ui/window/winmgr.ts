import { UIWindow } from "./uiwindow"
import { StrFmt } from "../../util/string"

/**
 * 窗口管理器
 */
export class WindowManager {
    protected windows: { [name: string]: UIWindow } = {} // 窗口记录
    protected showStacks: UIWindow[] = [] // 窗口栈(存放显示中的窗口)

    /**
     * 绑定窗口
     * @param win 窗口
     * @returns 结果(true:成功,false:失败)
     */
    public Bind(win: UIWindow): boolean {
        // 校验参数
        if (!win) {
            console.error("Bind:参数无效")
            return false
        }

        let name = win.Window()

        // 过滤重复
        if (this.windows[name]) {
            console.error(StrFmt("Bind:窗口已经绑定(name:%v)", name))
            return false
        }

        // 记录窗口
        this.windows[name] = win

        return true
    }

    /**
     * 检查窗口是否存在
     * @param name 窗口名
     * @returns 结果(true:存在,false:不存在)
     */
    public CheckWindow(name: string): boolean {
        // 校验参数
        if (!name || name.length == 0) {
            console.error("CheckWindow:参数无效")
            return false
        }

        // 窗口不存在
        if (!this.windows[name]) {
            return false
        }

        return true
    }

    /**
     * 窗口是否显示中
     * @param name 窗口名
     * @returns 结果(true:显示,false:隐藏)
     */
    public IsShow(name: string): boolean {
        // 校验参数
        if (!name || name.length == 0) {
            console.error("IsShow:参数无效")
            return false
        }

        // 无显示窗口
        if (this.showStacks.length == 0) {
            return false
        }

        // 遍历窗口名
        for (let i = 0; i < this.showStacks.length; i++) {
            if (this.showStacks[i].Window() == name) {
                return true
            }
        }

        return false
    }

    /**
     * 显示窗口
     * @param name 窗口名
     * @param cb 窗口关闭回调
     * @param begs 启动参数
     * @returns 结果
     */
    public ShowWindow(name: string, cb: (...args: any[]) => void, ...begs: any[]): boolean {
        // 校验参数
        if (!name || name.length == 0) {
            console.error("ShowWindow:参数无效")
            return false
        }

        // 获取窗口对象
        let win = this.windows[name]

        // 放入栈中
        this.showStacks.push(win)

        // 执行显示
        win["show"](cb, ...begs)

        return true
    }

    /**
     * 关闭窗口
     * @param name 窗口名
     * @param ends 回调参数
     * @returns 结果
     */
    public CloseWindow(name: string, ...ends: any[]): boolean {
        // 校验参数
        if (!name || name.length == 0) {
            console.error("CloseWindow:参数无效")
            return false
        }

        // 遍历窗口名
        for (let i = 0; i < this.showStacks.length; i++) {
            if (this.showStacks[i].Window() == name) {
                // 移除窗口
                this.showStacks.splice(i, 1)
                break
            }
        }

        // 执行关闭
        this.windows[name]["close"](...ends)

        return false
    }

    /**
     * 关闭所有窗口
     */
    public CloseAll() {
        // 遍历关闭
        for (let i = this.showStacks.length - 1; i >= 0; i--) {
            this.CloseWindow(this.showStacks[i].Window())
        }
    }
}

/**
 * 获取窗口管理对象
 * @returns 管理对象
 */
export function GetWinMgr(): WindowManager {
    return winMgr
}

/**
 * 管理对象
 */
let winMgr: WindowManager = new WindowManager()