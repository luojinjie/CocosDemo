/**
 * 深拷贝数据
 * @param data 数据
 * @returns 拷贝结果
 */
export function DeepClone<T>(data: T): T {
    // 校验参数
    if (!data || typeof data !== "object") {
        return data
    }

    let clone = null

    if (Array.isArray(data)) {
        // 数组
        clone = []

        for (let i = 0; i < data["length"]; i++) {
            clone[i] = DeepClone(data[i])
        }
    } else {
        // 对象
        clone = {}

        for (let k in data) {
            clone[k] = DeepClone(data[k])
        }
    }

    return clone
}