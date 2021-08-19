import { GetPromptMgr } from "../prompt/promptmgr";
import { MapData, InstanceMap, MapType, NormarlMap } from "../../data/map_d";
import { GetMapLib } from "../../lib/map_l";

/**
 * 地图管理
 */
export class MapManager {
    private mapList: { [id: number]: MapData } = {} // 地图信息列表

    /**
     * 构造函数
     */
    constructor() {
        this.mapList = GetMapLib().GetMapList()
    }

    /**
     * 获取地图信息
     * @param id 地图ID
     * @returns 地图信息
     */
    public GetMap(id: number): MapData {
        // 地图不存在
        if (!this.mapList[id]) {
            console.error("GetMap:地图不存在")
            return null
        }

        return this.mapList[id]
    }

    /**
     * 获取地图列表
     * @returns 地图列表
     */
    public GetMapList(): { [id: number]: MapData } {
        return this.mapList
    }

    /**
     * 进入地图
     * @param id 地图ID
     * @returns 错误信息
     */
    public EnterMap(id: number): string {
        // 地图不存在
        if (!this.mapList[id]) {
            return "EnterMap:地图不存在"
        }

        // 普通地图未解锁
        if (this.mapList[id].Type == MapType.MT_Normal && !(<NormarlMap>this.mapList[id]).Unlocked) {
            return "EnterMap:地图未解锁"
        }

        return null
    }

    /**
     * 解锁地图
     * @param id 地图ID
     * @returns 错误信息
     */
    public UnlockMap(id: number): string {
        // 地图不存在
        if (!this.mapList[id]) {
            return "UnlockMap:地图不存在"
        }

        // 地图类型异常
        if (this.mapList[id].Type != MapType.MT_Normal) {
            return "UnlockMap:地图类型异常"
        }

        // 数据转换
        let map = <NormarlMap>this.mapList[id]

        // 已解锁
        if (map.Unlocked) {
            return "UnlockMap:地图已解锁"
        }

        // 更新解锁
        map.Unlocked = true

        return null
    }

    /**
     * 更新副本进度
     * @param id 地图ID
     * @param record 进度记录
     * @returns 错误信息
     */
    public UpdateRecord(id: number, record: number): string {
        // 地图不存在
        if (!this.mapList[id]) {
            return "UpdateRecord:地图不存在"
        }

        // 地图类型异常
        if (this.mapList[id].Type != MapType.MT_Normal) {
            return "UpdateRecord:地图类型异常"
        }

        // 更新记录
        (<InstanceMap>this.mapList[id]).Record = record

        return null
    }

    /**
     * 通关副本
     * @param id 地图ID
     * @returns 错误信息
     */
    public PassInst(id: number): string {
        // 地图不存在
        if (!this.mapList[id]) {
            return "PassInst:地图不存在"
        }

        // 地图类型异常
        if (this.mapList[id].Type != MapType.MT_Normal) {
            return "PassInst:地图类型异常"
        }

        // 更新通关次数
        (<InstanceMap>this.mapList[id]).Pass++

        return null
    }

    /**
     * 增加副本次数
     * @param id 地图ID
     * @returns 错误信息
     */
    public AddInstTimes(id: number): string {
        // 地图不存在
        if (!this.mapList[id]) {
            return "AddInstTimes:地图不存在"
        }

        // 地图类型异常
        if (this.mapList[id].Type != MapType.MT_Instance) {
            return "AddInstTimes:地图类型异常"
        }

        // 数据转换
        let map = <InstanceMap>this.mapList[id]

        // 未通关
        if (map.Pass == 0) {
            return "AddInstTimes:副本未通关"
        }

        // 更新通关次数
        map.Pass--

        // 提示信息
        GetPromptMgr().ShowMsg("副本 " + this.mapList[id].Name + " 成功增加1次！")

        return null
    }
}