/**
 * 提示管理
 */
export class PromptManager {
    private nPrompt: cc.Node = null // 提示框节点
    private lPrompt: cc.Label = null // 提示文本组件

    /**
     * 绑定提示框
     * @param node 提示框
     */
    public BindPrompt(node: cc.Node) {
        // 校验节点
        if (!node) {
            console.error("BindPrompt:提示框节点无效")
            return
        }

        // 校验组件
        let child = node.getChildByName("label_prompt")
        if (!child || !child.getComponent(cc.Label)) {
            console.error("BindPrompt:提示文本组件无效")
            return
        }

        // 绑定信息
        this.nPrompt = node
        this.lPrompt = child.getComponent(cc.Label)
    }

    /**
     * 显示提示信息
     * @param msg 提示信息
     */
    public ShowMsg(msg: string) {
        // 校验信息
        if (!msg || msg.length == 0) {
            console.error("ShowMsg:提示信息无效")
            return
        }

        // 更新提示信息
        this.lPrompt.string = msg

        // 显示提示框
        if (!this.nPrompt.active) {
            this.nPrompt.active = true
        } else {
            this.lPrompt.unscheduleAllCallbacks()
        }

        // 2秒后关闭
        this.lPrompt.scheduleOnce(this.hide.bind(this), 2)
    }

    /**
     * 关闭提示框
     */
    private hide() {
        this.nPrompt.active = false
    }
}

/**
 * 获取提示管理对象
 * @returns 管理对象
 */
export function GetPromptMgr(): PromptManager {
    return promptMgr
}

/**
 * 管理对象
 */
let promptMgr: PromptManager = new PromptManager()