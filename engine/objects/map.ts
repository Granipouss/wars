import { MapData } from '../data/map';
import { TerrainData, TerrainType, TerrainsData } from '../data/terrain';
import { GameException } from '../game.exception';
import { Coordinates } from './coordinates';
import { GameProperty } from './property';
import type { WithData } from './types';
import { GameUnit } from './unit';

/**
 * GameTile
 * ---
 * A map's tile
 */
export class GameTile implements WithData<TerrainData, TerrainType> {
    constructor(
        //
        readonly x: number,
        readonly y: number,
        readonly type: TerrainType,
    ) {}

    /** Unit on the tile if any */
    unit: GameUnit | null = null;

    /** Property on the tile if any */
    property: GameProperty | null = null;

    get data() {
        return TerrainsData[this.type];
    }

    get pos(): Coordinates {
        return [this.x, this.y];
    }
}

/**
 * GameMap
 * ---
 * A battlefield's map
 */
export class GameMap {
    readonly name: string;

    readonly width: number;
    readonly height: number;

    readonly tiles: GameTile[];

    constructor(readonly data: MapData) {
        this.name = data.name;
        this.width = data.width;
        this.height = data.height;

        this.tiles = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const idx = x + y * this.width;
                this.tiles[idx] = new GameTile(x, y, data.tiles[idx]);
            }
        }
    }

    /**
     * Gets tile at a given position.
     *
     * Will throw if invalid coordinates.
     */
    at([x, y]: Coordinates): GameTile {
        if (!this.isValid([x, y])) throw new GameException(`Coordinates (${x}, ${y}) are out of bounds.`);
        const idx = x + y * this.width;
        return this.tiles[idx];
    }

    /**
     * Checks if coordinates are valid.
     */
    isValid([x, y]: Coordinates): boolean {
        if (x < 0 || x >= this.width) return false;
        if (y < 0 || y >= this.height) return false;
        return true;
    }

    /**
     * Returns valid coordinates that are next to a given posiition.
     */
    neighbours([x, y]: Coordinates): Coordinates[] {
        const all: Coordinates[] = [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1],
        ];
        return all.filter((pos) => this.isValid(pos));
    }
}
