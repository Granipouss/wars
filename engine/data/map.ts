import type { PropertyType } from './property';
import type { TerrainType } from './terrain';
import type { UnitType } from './unit';

export interface MapData {
    readonly name: string;
    readonly playerCount: number;
    readonly width: number;
    readonly height: number;
    readonly tiles: TerrainType[];
    readonly properties: readonly {
        readonly x: number;
        readonly y: number;
        readonly type: PropertyType;
        readonly team: number;
    }[];
    readonly units: readonly {
        readonly x: number;
        readonly y: number;
        readonly type: UnitType;
        readonly team: number;
    }[];
}
