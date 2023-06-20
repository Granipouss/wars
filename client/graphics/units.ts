import { Coordinates, GameUnit } from '../../engine';
import { lastFrom } from '../../engine/utils';
import { BaseSprite } from './base';
import { AnimationFrames, TileSize } from './constants';
import { coroutine } from './utils';
import { BaseTexture, DisplayObject, Rectangle, Sprite, Texture } from 'pixi.js';

const UnitsTextures: Record<string, Texture> = {};
{
    const baseTexture = BaseTexture.from('img/units.png');
    const colors = ['red', 'blue', 'green', 'yellow', 'black'];
    const types = [
        'infantry',
        'infantry-B',
        'infantry-C',
        'infantry-D',
        'infantry-E',
        'mech',
        'mech-B',
        'mech-C',
        'mech-D',
        'mech-E',
        'recon',
        'tank',
        'mediumTank',
        'neoTank',
        'megaTank',
        'apc',
        'antiAir',
        'artillery',
        'rocket',
        'missile',
        'pipeRunner',
        'blob',
        'fighter',
        'bomber',
        'blackBomb',
        'stealth',
        'battleCopter',
        'transportCopter',
        'battleship',
        'cruiser',
        'sub',
        'lander',
        'blackBoat',
        'carrier',
    ];

    let y = 0;
    for (const type of types) {
        let x = 0;
        for (const color of colors) {
            for (let frame = 0; frame < 3; frame++) {
                UnitsTextures[`${type}-${color}-${frame + 1}`] = new Texture(
                    baseTexture,
                    new Rectangle(16 * x, 16 * y, 16, 16),
                );
                x++;
            }
            for (let frame = 0; frame < 3; frame++) {
                UnitsTextures[`${type}-${color}-down-${frame + 1}`] = new Texture(
                    baseTexture,
                    new Rectangle(16 * x, 16 * y, 16, 16),
                );
                x++;
            }
        }
        y++;
    }
}

const TagsTextures: Record<string, Texture> = {};
{
    const baseTexture = BaseTexture.from('img/tags.png');
    const colors = ['red', 'blue', 'green', 'yellow', 'black'];
    const types = [
        'fuel',
        'ammo',
        'load',
        'capture',
        'sub',
        'unknown',
        'cross',
        'hp-1',
        'hp-2',
        'hp-3',
        'hp-4',
        'hp-5',
        'hp-6',
        'hp-7',
        'hp-8',
        'hp-9',
        'hp-?',
    ];

    let x = 0;
    for (const type of types) {
        let y = 0;
        for (const color of colors) {
            TagsTextures[`${type}-${color}`] = new Texture(baseTexture, new Rectangle(8 * x, 8 * y, 8, 8));
            y++;
        }
        for (const color of colors) {
            TagsTextures[`${type}-${color}-down`] = new Texture(baseTexture, new Rectangle(8 * x, 8 * y, 8, 8));
            y++;
        }
        x++;
    }
}

const followPath = coroutine(function* (obj: DisplayObject, path: readonly Coordinates[]) {
    if (path.length < 1) return;

    const speed = 1 / TileSize;

    for (let i = 0; i < path.length - 1; i++) {
        const [Ax, Ay] = path[i];
        const [Bx, By] = path[i + 1];

        let t = 0;
        while (t < 1) {
            const dt: number = yield;
            t = Math.min(t + dt * speed, 1);
            obj.x = TileSize * (Ax * (1 - t) + Bx * t);
            obj.y = TileSize * (Ay * (1 - t) + By * t);
        }
    }

    const [x, y] = lastFrom(path);
    obj.x = TileSize * x;
    obj.y = TileSize * y;
    yield;
});

export class UnitSprite extends BaseSprite {
    constructor(readonly unit: GameUnit) {
        super();

        const color = unit.army.color;
        const type = unit.type;

        const sprite = new Sprite(UnitsTextures[`${type}-${color}-1`]);
        this.addChild(sprite);
        sprite.anchor.set(0.5, 1);
        sprite.position.set(TileSize / 2, TileSize);

        const hpSprite = new Sprite(TagsTextures[`hp-?-${color}`]);
        this.addChild(hpSprite);
        hpSprite.anchor.set(1, 1);
        hpSprite.position.set(TileSize, TileSize);

        this.observe(
            () => [unit.visualHP, unit.active],
            ([hp, active]) => {
                if (!hp) return;
                if (hp < 10) {
                    hpSprite.texture = TagsTextures[`hp-${hp}-${color}${active ? '' : '-down'}`];
                    hpSprite.visible = true;
                } else {
                    hpSprite.visible = false;
                }
            },
        );

        this.observe(
            () => [this.y],
            ([y]) => {
                this.zIndex = y + TileSize;
            },
        );

        this.everyNthFrame((n) => {
            const frame = 1 + (n % 3);
            sprite.texture = UnitsTextures[`${type}-${color}${unit.active ? '' : '-down'}-${frame}`];
        }, AnimationFrames);

        this.moveTo(unit.pos);
    }

    moveTo([x, y]: Coordinates) {
        this.x = TileSize * x;
        this.y = TileSize * y;
    }

    async followPath(path: readonly Coordinates[]) {
        await this.run(followPath(this, path));
    }
}
