import { GetPromptMgr } from "../prompt/promptmgr"
import { CurrencyType } from "../../data/common_d"

/**
 * 用户货币管理
 */
export class CurrencyManager {
    private gold: number = 100000000 // 金币
    private ingot: number = 100000000 // 元宝
    private crystal: number = 100000000 // 水晶
    private prestige: number = 100000000 // 威望

    /**
     * 获取用户货币
     * @param type 货币类型
     * @returns 用户货币
     */
    public GetCurrency(type: number): number {
        // 校验参数
        if (type < CurrencyType.CT_Gold || type > CurrencyType.CT_Prestige) {
            console.error("GetCurrency:货币类型无效")
            return 0
        }

        switch (type) {
            case CurrencyType.CT_Gold:
                return this.gold
            case CurrencyType.CT_Ingot:
                return this.ingot
            case CurrencyType.CT_Crystal:
                return this.crystal
            case CurrencyType.CT_Prestige:
                return this.prestige
        }
    }

    /**
     * 修改用户货币
     * @param type 货币类型
     * @param value 货币数值
     * @returns 错误描述
     */
    public ChangeCurrency(type: number, value: number): string {
        // 校验参数
        if (type < CurrencyType.CT_Gold || type > CurrencyType.CT_Prestige) {
            console.error("ChangeCurrency:货币类型无效")
            return "ChangeCurrency:货币类型无效"
        }

        // 校验货币是否足够(扣除货币)
        if (value < 0 && !this.checkEnough(type, value)) {
            // 提示信息
            GetPromptMgr().ShowMsg(this.convertType(type) + "不足！")

            return "ChangeCurrency:货币不足"
        }

        switch (type) {
            case CurrencyType.CT_Gold:
                this.gold += value
                break
            case CurrencyType.CT_Ingot:
                this.ingot += value
                break
            case CurrencyType.CT_Crystal:
                this.crystal += value
                break
            case CurrencyType.CT_Prestige:
                this.prestige += value
                break
        }

        return null
    }

    // === 私有方法处理 ===

    /**
     * 校验货币是否足够
     * @param type 货币类型
     * @param value 货币数值
     * @returns 货币是否足够
     */
    private checkEnough(type: number, value: number): boolean {
        // 校验参数
        if (type < CurrencyType.CT_Gold || type > CurrencyType.CT_Prestige) {
            console.error("checkEnough:货币类型无效")
            return false
        }

        switch (type) {
            case CurrencyType.CT_Gold:
                return this.gold >= Math.abs(value)
            case CurrencyType.CT_Ingot:
                return this.ingot >= Math.abs(value)
            case CurrencyType.CT_Crystal:
                return this.crystal >= Math.abs(value)
            case CurrencyType.CT_Prestige:
                return this.prestige >= Math.abs(value)
        }
    }

    /**
     * 货币类型转换文本
     * @param type 货币类型
     * @returns 货币文本
     */
    private convertType(type: number): string {
        switch (type) {
            case CurrencyType.CT_Gold:
                return "金币"
            case CurrencyType.CT_Ingot:
                return "元宝"
            case CurrencyType.CT_Crystal:
                return "水晶"
            case CurrencyType.CT_Prestige:
                return "威望"
        }

        return null
    }
}