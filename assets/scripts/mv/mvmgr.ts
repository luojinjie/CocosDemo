import { IModel } from "../base/model"
import { IView } from "../base/view"
import { StrFmt } from "../util/string"

/**
 * 模型视图结构
 */
export class MVStruct {
    public Model: IModel = null // 模型
    public View: IView = null // 视图
}

/**
 * 模型视图管理
 */
export class MVManager {
    protected structs: { [name: string]: MVStruct } = {} // 结构列表

    /**
     * 添加模型视图结构
     * @param name 模型视图名
     * @param model 模型
     * @returns 结果(true:成功,false:失败)
     */
    public AddStruct(name: string, model: IModel): boolean {
        // 校验参数
        if (!name || name.length == 0 || !model) {
            console.error("AddStruct:参数无效")
            return false
        }

        // 过滤重复
        if (this.structs[name]) {
            console.error(StrFmt("AddStruct:结构已经添加(name:%v)", name))
            return false
        }

        // N:视图要等到加载之后才能绑定

        // 构造结构体
        let mv = new MVStruct()
        mv.Model = model

        // 记录结构
        this.structs[name] = mv

        console.log(StrFmt("AddStruct:结构添加成功(name:%v)", name))
    }

    /**
     * 绑定视图
     * @param name 模型视图名
     * @param view 视图对象
     * @returns 结果(true:成功,false:失败)
     */
    public BindView(name: string, view: IView): boolean {
        // 校验参数
        if (!name || name.length == 0 || !view) {
            console.error("BindView:参数无效")
            return false
        }

        // 模型视图结构不存在
        if (!this.structs[name]) {
            console.error("BindView:模型视图结构不存在|name:" + name)
            return false
        }

        // 绑定视图
        this.structs[name].View = view
    }

    /**
     * 视图请求数据
     * @param name 模型视图名
     * @param msg 消息类型
     * @param data 请求数据
     */
    public ReqData(name: string, msg: string, data: any) {
        console.log("ReqData:请求消息|" + msg)

        // 校验参数
        if (!name || name.length == 0) {
            console.error("ReqData:参数无效")
            return
        }

        // 模型视图结构不存在
        if (!this.structs[name]) {
            console.error("ReqData:模型视图结构不存在")
            return
        }

        // 通知模型
        this.structs[name].Model.ReqNotify(msg, data)
    }

    /**
     * 模型响应数据
     * @param name 模型视图名
     * @param msg 消息类型
     * @param data 应答数据
     */
    public ResData(name: string, msg: string, data: any) {
        console.log("ResData:响应数据|" + msg)

        // 校验参数
        if (!name || name.length == 0) {
            console.error("ResData:参数无效")
            return
        }

        // 模型视图结构不存在
        if (!this.structs[name]) {
            console.error("ResData:模型视图结构不存在")
            return
        }

        // 通知视图
        this.structs[name].View.ResNotify(msg, data)
    }
}

/**
 * 获取模型视图管理对象
 * @returns 管理对象
 */
export function GetMVMgr(): MVManager {
    return mvMgr
}

/**
 * 管理对象
 */
let mvMgr: MVManager = new MVManager()