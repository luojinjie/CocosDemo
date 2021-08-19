import { MapData, InstanceMap, MapType, NormarlMap } from "../data/map_d";
import { EnemyData } from "../data/pet_d";
import { DeepClone } from "../util/clone";
import { Json2Tmp } from "../util/json";
import { StrFmt } from "../util/string";

/**
 * 地图库
 */
export class MapLib {
    private mapList: { [id: number]: MapData } = {} // 地图列表

    /**
     * 加载地图列表
     * @param json json数据
     * @returns 错误描述
     */
    public FromJson(json: string): string {
        // 解析json数据
        let ps: any = {}
        try {
            ps = JSON.parse(json)
            if (typeof ps !== "object" && !ps.sort) {
                throw "err"
            }
        } catch (e) {
            return StrFmt("FromJson:解析json数据失败(json:%v)", json)
        }

        // 加载列表
        for (let i = 0; i < ps.length; i++) {
            if (!ps[i]["Type"]) {
                console.error("FromJson:缺少关键数据(Type)")
                continue
            }

            // 构建地图信息
            let map: MapData = null
            if (ps[i]["Type"] == MapType.MT_Normal) {
                map = new NormarlMap()
            } else if (ps[i]["Type"] == MapType.MT_Instance) {
                map = new InstanceMap()
            }

            // 解析地图信息
            if (!Json2Tmp(map, ps[i])) {
                console.error("FromJson:解析地图信息失败")
                return
            }

            // N:需要用到类中方法
            // 转换为实体对象
            for (let j = 0; j < map.Enemys.length; j++) {
                // 构造敌人信息
                let enemy = new EnemyData()

                // 解析敌人信息
                if (!Json2Tmp(enemy, map.Enemys[j])) {
                    console.error("FromJson:解析敌人信息失败")
                    return
                }

                // 覆盖
                map.Enemys[j] = enemy
            }

            // 记录地图
            this.mapList[map.ID] = map
        }
    }

    /**
     * 获取地图列表
     * @returns 地图列表
     */
    public GetMapList(): { [id: number]: MapData } {
        // N:本地引用类型数据,需要深拷贝
        // return this.mapList
        return DeepClone(this.mapList)
    }
}

/**
 * 获取地图库对象
 * @returns 管理对象
 */
export function GetMapLib(): MapLib {
    return mapLib
}

// === === ===

/**
 * 所有地图信息
 */
let maps = [
    // 新手基地
    {
        ID: 0x10001, Name: "新手基地", Type: 1, Unlocked: false, Enemys: [
            { ID: 0x10001, Name: "金波姆", Dept: 1, Stage: 1, BaseAttr: { HP: 220, MP: 120, Atk: 75, Def: 25, Hit: 25, Dod: 25, Spd: 25 }, Level: 1, Exp: 20, Spoils: [{ ID: 0x70001, Rate: 100 }, { ID: 0x80001, Rate: 50 }, { ID: 0xA1001, Rate: 50 }], Gold: 100 },
            { ID: 0x20001, Name: "绿波姆", Dept: 2, Stage: 1, BaseAttr: { HP: 250, MP: 100, Atk: 70, Def: 20, Hit: 20, Dod: 20, Spd: 23 }, Level: 1, Exp: 20, Spoils: [{ ID: 0x70002, Rate: 100 }, { ID: 0x80002, Rate: 50 }, { ID: 0xA1001, Rate: 50 }], Gold: 100 },
            { ID: 0x30001, Name: "水波姆", Dept: 3, Stage: 1, BaseAttr: { HP: 220, MP: 120, Atk: 80, Def: 30, Hit: 25, Dod: 20, Spd: 24 }, Level: 1, Exp: 20, Spoils: [{ ID: 0x70003, Rate: 100 }, { ID: 0x80003, Rate: 50 }, { ID: 0xA1001, Rate: 50 }], Gold: 100 },
            { ID: 0x40001, Name: "火波姆", Dept: 4, Stage: 1, BaseAttr: { HP: 200, MP: 100, Atk: 100, Def: 20, Hit: 20, Dod: 20, Spd: 22 }, Level: 1, Exp: 20, Spoils: [{ ID: 0x70004, Rate: 100 }, { ID: 0x80004, Rate: 50 }, { ID: 0xA1001, Rate: 50 }], Gold: 100 },
            { ID: 0x50001, Name: "土波姆", Dept: 5, Stage: 1, BaseAttr: { HP: 220, MP: 120, Atk: 70, Def: 40, Hit: 30, Dod: 20, Spd: 21 }, Level: 1, Exp: 20, Spoils: [{ ID: 0x70005, Rate: 100 }, { ID: 0x80005, Rate: 50 }, { ID: 0xA1001, Rate: 50 }], Gold: 100 },
        ]
    }
]

/**
 * 地图库
 */
let mapLib: MapLib = new MapLib()
mapLib.FromJson(JSON.stringify(maps))
console.log(mapLib)