/**
 * 加载道具icon
 * @param spr 图片节点
 * @param type 道具类型
 */
export function LoadPropIcon(spr: cc.Sprite, type: number) {
    cc.resources.load("textures/icon/prop" + type, cc.SpriteFrame, (error: Error, sf: cc.SpriteFrame) => {
        if (error) {
            cc.error("LoadPropIcon:加载道具icon图片失败");
            return;
        }

        spr.spriteFrame = sf
    })
}