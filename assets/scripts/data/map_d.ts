import { EnemyData } from "./pet_d"

// === enum ===

/**
 * 地图列表
 */
export enum MapList {
    ML_Novice = 1, // 新手基地
}

/**
 * 地图类型
 */
export enum MapType {
    MT_Normal = 1, // 普通地图
    MT_Instance = 2, // 副本地图
    MT_Special = 3, // 特殊地图
}

// === class ===

/**
 * 地图基础信息
 */
export class MapData {
    public ID: number = 0 // 地图ID
    public Name: string = "" // 地图名称
    public Type: number = 0 // 地图类型
    public Enemys: EnemyData[] = [] // 怪物列表
}

/**
 * 普通地图信息
 */
export class NormarlMap extends MapData {
    public Unlocked: boolean = false // 已解锁
}

/**
 * 副本地图信息
 */
export class InstanceMap extends MapData {
    public Limit: number = 0 // 限制等级
    public Pass: number = 0 // 通关次数
    public Times: number = 0 // 每日次数
    public Record: number = 0 // 进度记录
}