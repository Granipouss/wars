import { GameProperty } from '../../engine';
import { BaseSprite } from './base';
import { AnimationFrames, TileSize } from './constants';
import { BaseTexture, Rectangle, Sprite, Texture } from 'pixi.js';

const PropertiesTextures: Record<string, Texture> = {};
{
    const baseTexture = BaseTexture.from('img/properties.png');
    const colors = ['red', 'blue', 'green', 'yellow', 'black', 'grey', 'dark'];
    const types = ['hq', 'hq-B', 'hq-C', 'hq-D', 'hq-E', 'city', 'base', 'airport', 'port', 'comtower', 'lab'];

    let x = 0;
    for (const type of types) {
        const frames = type === 'base' ? 4 : 2;
        for (let frame = 0; frame < frames; frame++) {
            let y = 0;
            for (const color of colors) {
                PropertiesTextures[`${type}-${color}-${frame + 1}`] = new Texture(
                    baseTexture,
                    new Rectangle(16 * x, 32 * y, 16, 32),
                );
                y++;
            }
            x++;
        }
    }
}

export class PropertySprite extends BaseSprite {
    constructor(readonly property: GameProperty) {
        super();

        const color = property.army?.color ?? 'grey';
        const type = property.type;

        const sprite = new Sprite(PropertiesTextures[`${type}-${color}-1`]);
        this.addChild(sprite);
        sprite.anchor.set(0.5, 1);
        sprite.position.set(TileSize / 2, TileSize);
        this.x = TileSize * property.x;
        this.y = TileSize * property.y;
        this.zIndex = this.y;

        const frames = property.type === 'base' ? 4 : 2;
        this.everyNthFrame((n) => {
            const frame = 1 + (n % frames);
            sprite.texture = PropertiesTextures[`${type}-${color}-${frame}`];
        }, AnimationFrames);
    }
}
