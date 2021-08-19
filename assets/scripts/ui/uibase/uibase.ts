import { GetWinMgr } from "../window/winmgr"
import { StrFmt } from "../../util/string"

/**
 * UI组件
 * @extends cc.Component
 */
export class UIBase extends cc.Component {
    /**
     * 获取脚本名
     * @returns 脚本名
     */
    protected getScriptName(): string {
        // 对象名称,格式:xxx<脚本名>
        let name = this.name

        // 获取起止位置
        let start = name.indexOf("<")
        let end = name.indexOf(">")

        // 过滤异常
        if (start == -1 || end == -1 || start + 1 == end) {
            console.error("getScriptName:脚本名异常")
            return null
        }

        return name.substring(start + 1, end)
    }

    /**
     * 异步加载显示窗口
     * @param url 预制体路径
     * @param name 窗口名
     * @param parent 父节点
     * @param cb 窗口关闭回调
     * @param begs 启动参数
     */
    protected asyncShowWindow(url: string, name: string, parent: cc.Node, cb: (...args: any[]) => void, ...begs: any[]) {
        if (!url || url.length == 0 || !parent) {
            console.error("asyncShowWindow:参数无效")
            return
        }

        // 获取窗口管理对象
        let mgr = GetWinMgr()

        // 窗口已加载
        if (mgr.CheckWindow(name)) {
            // 窗口显示中
            if (mgr.IsShow(name)) {
                console.log(StrFmt("asyncShowWindow:窗口已显示(name:%v)", name))
                return
            }

            // 显示窗口
            mgr.ShowWindow(name, cb, ...begs)

            return
        }

        // 加载窗口预制体
        cc.resources.load(url, cc.Prefab, (err: Error, prefab: cc.Prefab) => {
            if (err) {
                console.error("asyncShowWindow:加载失败")
                return
            }

            // 设置透明,让脚本执行加载
            let node = cc.instantiate(prefab)
            node.opacity = 0

            // 绑定节点
            parent.addChild(node)

            // 显示窗口
            mgr.ShowWindow(name, cb, ...begs)
        })
    }

    /**
     * 绑定点击事件
     * @param node 按钮节点
     * @param script 脚本组件
     * @param handler 处理函数
     * @param data 自定义数据
     */
    protected bindClickEvent(node: cc.Node, handler: string, data: string) {
        // 校验参数
        if (!node || !handler) {
            console.error("bindClickEvent:参数无效")
            return
        }

        // 校验按钮
        let btn = node.getComponent(cc.Button)
        if (!btn) {
            console.error("bindClickEvent:非按钮节点")
            return
        }

        // 构造事件回调函数
        let event = new cc.Component.EventHandler();
        event.target = this.node
        event.component = this.getScriptName()
        event.handler = handler
        event.customEventData = data

        btn.clickEvents.push(event)
    }
}