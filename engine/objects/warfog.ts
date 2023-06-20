import { GameException } from '../game.exception';
import type { GameArmy } from './army';
import type { GameBattlefield } from '../game.battlefield';
import { Coordinates, dist } from './coordinates';
import type { GameMap } from './map';

/**
 * GameFogTile
 * ---
 * A war fog's tile
 */
export class GameFogTile {
    foggy = true;

    readonly hidingPlace: boolean;

    constructor(
        //
        readonly x: number,
        readonly y: number,
        map: GameMap,
    ) {
        const tile = map.at([x, y]);
        this.hidingPlace = ['forest', 'reef'].includes(tile.type);
    }

    get pos(): Coordinates {
        return [this.x, this.y];
    }
}

/**
 * GameWarFog
 * ---
 * An army's fog of war
 */
export class GameWarFog {
    readonly width: number;
    readonly height: number;

    readonly tiles: GameFogTile[];

    constructor(
        readonly battlefield: GameBattlefield, //
        readonly army: GameArmy,
    ) {
        this.width = battlefield.map.width;
        this.height = battlefield.map.height;

        this.tiles = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const idx = x + y * this.width;
                this.tiles[idx] = new GameFogTile(x, y, battlefield.map);
            }
        }
    }

    /**
     * Recalculates the fog
     */
    refresh(): void {
        for (const tile of this.tiles) {
            tile.foggy = true;
        }

        for (const tile of this.tiles) {
            for (const unit of this.army.units) {
                const d = dist(tile.pos, unit.pos);
                const visible = tile.hidingPlace ? d <= 1 : d <= unit.data.vision;
                if (visible) {
                    tile.foggy = false;
                    continue;
                }
            }
            if (!tile.foggy) continue;

            for (const property of this.army.properties) {
                const d = dist(tile.pos, property.pos);
                const visible = d === 0;
                if (visible) {
                    tile.foggy = false;
                    continue;
                }
            }
            if (!tile.foggy) continue;
        }
    }

    /**
     * Checks if foggy at a given position.
     *
     * Will throw if invalid coordinates.
     */
    at([x, y]: Coordinates): boolean {
        if (!this.battlefield.map.isValid([x, y]))
            throw new GameException(`Coordinates (${x}, ${y}) are out of bounds.`);
        const idx = x + y * this.width;
        return this.tiles[idx].foggy;
    }
}
