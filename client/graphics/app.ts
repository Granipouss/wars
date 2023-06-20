import { GameBattlefield, IGame } from '../../engine';
import { BaseSprite } from './base';
import { TileSize } from './constants';
import { MapLayerSprite } from './map';
import { PropertySprite } from './properties';
import { UnitSprite } from './units';
import { stream, wait } from './utils';
import { Container, DisplayObject, Application as PixiApplication } from 'pixi.js';

export class Application extends PixiApplication<HTMLCanvasElement> {
    constructor(readonly slot: number, readonly game: IGame) {
        super();

        const updateChildren = (obj: DisplayObject, dt: number) => {
            obj.children?.forEach((child) => {
                if (child instanceof BaseSprite) {
                    child.update(dt);
                }
                if (child instanceof Container) {
                    updateChildren(child, dt);
                }
            });
        };
        this.ticker.add((dt) => updateChildren(this.stage, dt));
    }

    async run() {
        for await (const event of stream(this.game.events)) {
            // console.log(event);
            switch (event.type) {
                case 'state': {
                    this.battlefield = new GameBattlefield(event.state);
                    break;
                }
                case 'move': {
                    const sprite = this.unitSprites.get(event.unitId)!;
                    await sprite.followPath(event.path);
                    break;
                }
                case 'death': {
                    const sprite = this.unitSprites.get(event.unitId)!;
                    sprite.removeFromParent();
                    this.unitSprites.delete(event.unitId);
                    break;
                }
                case 'build': {
                    const unit = this.battlefield.units.find((u) => u.id === event.unit.id!)!;
                    const sprite = new UnitSprite(unit);
                    this.unitSprites.set(unit.id, sprite);
                    this.mapLayer.addChild(sprite);
                    break;
                }
            }
            if (event.type !== 'state') {
                this.battlefield?.patch(event);
            }
            this.army.warfog?.refresh();
            await wait(100);
        }
    }

    mapLayer = new Container();

    propertySprites!: Map<string, PropertySprite>;
    unitSprites!: Map<string, UnitSprite>;

    #battlefield!: GameBattlefield;
    get battlefield() {
        return this.#battlefield;
    }
    set battlefield(value: GameBattlefield) {
        this.#battlefield = value;

        const width = TileSize * this.battlefield.map.width;
        const height = TileSize * this.battlefield.map.height;
        this.renderer.resize(width, height);
        this.render();

        this.stage.removeChildren();
        this.mapLayer.removeChildren();
        this.stage.addChild(this.mapLayer);
        this.mapLayer.sortableChildren = true;

        for (let y = 0; y < this.battlefield.map.height; y++) {
            this.mapLayer.addChild(new MapLayerSprite(this.battlefield.map, y, this.army.warfog || undefined));
        }

        this.propertySprites = new Map<string, PropertySprite>();
        this.battlefield.properties.forEach((property) => {
            const sprite = new PropertySprite(property);
            this.propertySprites.set(property.id, sprite);
            this.mapLayer.addChild(sprite);
        });

        this.unitSprites = new Map<string, UnitSprite>();
        this.battlefield.units.forEach((unit) => {
            const sprite = new UnitSprite(unit);
            this.unitSprites.set(unit.id, sprite);
            this.mapLayer.addChild(sprite);
        });
    }

    get army() {
        return this.battlefield.armies[this.slot];
    }
}
