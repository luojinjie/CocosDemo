/**
 * 视图接口
 */
export interface IView {
    /**
     * 响应通知(模型响应)
     * @param msg 消息类型
     * @param data 响应数据
     */
    ResNotify(msg: string, data: any): void
}