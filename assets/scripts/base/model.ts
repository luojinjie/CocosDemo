/**
 * 模型接口
 */
export interface IModel {
    /**
     * 请求通知(视图请求)
     * @param msg 消息类型
     * @param data 请求数据
     */
    ReqNotify(msg: string, data: any): void
}