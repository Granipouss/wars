import type { PropertyData, PropertyType } from '../data/property';
import { PropertiesData } from '../data/property';
import type { GameArmy } from './army';
import type { GameBattlefield } from '../game.battlefield';
import type { Coordinates } from './coordinates';
import type { GameMap, GameTile } from './map';
import type { WithData, WithState } from './types';

export type PropertyState = {
    readonly id?: string;
    readonly armyId?: string;
    readonly type: PropertyType;
    readonly x: number;
    readonly y: number;
};

/**
 * GameProperty
 * ---
 * A battlefield's property
 */
export class GameProperty implements WithState<PropertyState>, WithData<PropertyData, PropertyType> {
    readonly id: string;

    readonly map: GameMap;
    army: GameArmy | null;

    readonly type: PropertyType;

    readonly x: number;
    readonly y: number;

    constructor(
        readonly battlefield: GameBattlefield, //
        state: PropertyState,
    ) {
        this.map = battlefield.map;
        this.army = battlefield.armies.find((t) => t.id === state.armyId) ?? null;

        this.id = state.id ?? `${state.type}_${battlefield.uid()}`;
        this.type = state.type;

        this.x = state.x;
        this.y = state.y;

        this.army?.properties.push(this);
        this.map.at(this.pos).property = this;
    }

    get state(): PropertyState {
        return {
            id: this.id,
            armyId: this.army?.id,
            type: this.type,
            x: this.x,
            y: this.y,
        };
    }

    get data(): PropertyData {
        return PropertiesData[this.type];
    }

    get pos(): Coordinates {
        return [this.x, this.y];
    }

    get tile(): GameTile {
        return this.map.at(this.pos);
    }

    isAllied(army: GameArmy) {
        return this.army === army;
    }
}
