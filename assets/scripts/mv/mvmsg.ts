// 模型与视图之间的消息定义

// === main view ===

export enum ExploreMsg {
    EM_MapListReq = "MapListReq", // 地图列表
    EM_MapListRes = "MapListRes", // 地图列表
    EM_UnlockMapReq = "UnlockMapReq", // 解锁地图
    EM_UnlockMapRes = "UnlockMapRes", // 解锁地图
    EM_EnterMapReq = "EnterMapReq", // 进图地图
    EM_EnterMapRes = "EnterMapRes", // 进图地图
}

export enum PetMsg {
    PM_SetMainReq = "SetMainReq", // 设置主战宠物
    PM_SetMainRes = "SetMainRes", // 设置主战宠物
}

// === window view ===

/**
 * 商店消息
 */
export enum ShopMsg {
    SM_GoldGoodsReq = "GoldGoodsReq", // 金币商品
    SM_GoldGoodsRes = "GoldGoodsRes", // 金币商品
    SM_IngotGoodsReq = "IngotReq", // 元宝商品
    SM_IngotGoodsRes = "IngotRes", // 元宝商品
    SM_PrestigeGoodsReq = "PrestigeReq", // 威望商品
    SM_PrestigeGoodsRes = "PrestigeRes", // 威望商品
    SM_BuyReq = "BugReq", // 购买商品
    SM_BuyRes = "BugRes", // 购买商品
    SM_SellReq = "SellReq", // 出售道具
    SM_SellRes = "SellRes" // 出售道具
}

/**
 * 容器列表消息
 */
export enum ContainerMsg {
    CM_PackReq = "PackReq", // 背包列表
    CM_PackRes = "PackRes", // 背包列表
    CM_WarehouseReq = "WarehouseReq", // 仓库列表
    CM_WarehouseRes = "WarehouseRes", // 仓库列表
    CM_RanchReq = "RanchReq", // 牧场列表
    CM_RanchRes = "RanchRes", // 牧场列表
    CM_CarryReq = "CarryReq", // 携带列表
    CM_CarryRes = "CarryRes" // 携带列表
}

/**
 * 背包消息
 */
export enum BackpackMsg {
    PM_UseReq = "UseReq", // 使用道具
    PM_UseRes = "UseRes", // 使用道具
    PM_DropReq = "DropReq", // 丢弃道具
    PM_DropRes = "DropRes", // 丢弃道具
    PM_IntoReq = "IntoReq", // 放入仓库
    PM_IntoRes = "IntoRes" // 放入仓库
}

/**
 * 仓库消息
 */
export enum WarehouseMsg {
    WM_TakeInReq = "TakeInReq", // 放入仓库
    WM_TakeInRes = "TakeInRes", // 放入仓库
    WM_TakeOutReq = "TakeOutReq", // 取出仓库
    WM_TakeOutRes = "TakeOutRes" // 取出仓库
}

/**
 * 牧场消息
 */
export enum RanchMsg {
    RM_TakeInReq = "TakeInReq", // 放入牧场
    RM_TakeInRes = "TakeInRes", // 放入牧场
    RM_TakeOutReq = "TakeOutReq", // 取出牧场
    RM_TakeOutRes = "TakeOutRes", // 取出牧场
    RM_SetMainReq = "SetMainReq", // 设置主战
    RM_SetMainRes = "SetMainRes" // 设置主战
}

/**
 * 战斗消息
 */
export enum FightMsg {
    FM_GetFightBaseReq = "GetFightBaseReq", // 获取基础战斗信息
    FM_GetFightBaseRes = "GetFightBaseRes", // 获取基础战斗信息
    FM_UserOperReq = "UserOperReq", // 用户操作
    FM_UserOperRes = "UserOperRes", // 用户操作
    FM_PropListReq = "PropListReq", // 获取道具列表
    FM_PropListRes = "PropListRes", // 获取道具列表
}

/**
 * 神殿消息
 */
export enum TempleMsg {
    TM_PropListReq = "PropListReq", // 获取道具列表
    TM_PropListRes = "PropListRes", // 获取道具列表
    TM_PetEvolveReq = "PetEvolveReq", // 宠物进化
    TM_PetEvolveRes = "PetEvolveRes", // 宠物进化
    TM_PetSynthesisReq = "PetSynthesisReq", // 宠物合成
    TM_PetSynthesisRes = "PetSynthesisRes", // 宠物合成
    TM_PetNirvanaReq = "PetNirvanaReq", // 宠物转生
    TM_PetNirvanaRes = "PetNirvanaRes", // 宠物转生
}

/**
 * 地图信息消息
 */
export enum MapInfoMsg {
    MIM_SetMainReq = "SetMainReq", // 设置主战宠物
    MIM_SetMainRes = "SetMainRes", // 设置主战宠物
    MIM_EnterFightReq = "EnterFightReq", // 进入战斗
    MIM_EnterFightRes = "EnterFightRes", // 进入战斗
}

/**
 * 货币消息
 */
export enum CurrencyMsg {
    CM_GetCurrencyReq = "GetCurrencyReq", // 获取货币信息
    CM_GetCurrencyRes = "GetCurrencyRes", // 获取货币信息
}