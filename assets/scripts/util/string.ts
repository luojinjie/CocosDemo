/**
 * 格式化字符串
 * @param msg 字符串信息
 * @param args 格式化对象
 * @returns 格式化结果
 */
export function StrFmt(msg: string, ...args: any[]): string {
    // 校验参数
    if (!msg || msg.length == 0) {
        return ""
    }

    // 格式化结果
    let result: string = ""
    // 参数索引
    let index: number = 0

    for (let i = 0; i < msg.length; i++) {
        // N:固化格式 %v
        if (i != msg.length - 1 && msg[i] == "%" && msg[i + 1] == "v") {
            if (args.length > index) {
                result += JSON.stringify(args[index++]).replace(/([\'\"\\])/g, "")
            }
            i++
        } else {
            result += msg[i]
        }
    }

    return result
}