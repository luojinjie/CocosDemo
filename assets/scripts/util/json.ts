/**
 * 解析json数据到模板对象
 * @param tmp 模版
 * @param json json字符串|json对象
 * @returns 解析结果
 */
export function Json2Tmp<T>(tmp: T, json: string | Object): boolean {
    // 校验参数
    if (!tmp || Object.keys(tmp).length == 0 || !json) {
        console.error("Json2Tmp:参数无效")
        return false
    }

    // 解析数据
    let ps = typeof json == "string" ? JSON.parse(json) : json
    for (let k in ps) {
        // N:简单赋值,内部结构不做处理了
        if (k in tmp && typeof tmp[k] === typeof ps[k]) {
            tmp[k] = ps[k]
        }
    }

    return true
}