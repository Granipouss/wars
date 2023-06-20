import type { UnitData, UnitType } from '../data/unit';
import { UnitsData, canCaptureUnits } from '../data/unit';
import { getBaseDamages } from '../managers/battle';
import { removeFrom } from '../utils';
import type { GameArmy } from './army';
import type { GameBattlefield } from '../game.battlefield';
import { Coordinates } from './coordinates';
import type { GameMap, GameTile } from './map';
import { WithData, WithState } from './types';

export type UnitState = {
    readonly id?: string;
    readonly armyId: string;
    readonly type: UnitType;
    readonly x: number;
    readonly y: number;
    readonly hp?: number;
    readonly fuel?: number;
    readonly ammo?: number;
    readonly active?: boolean;
};

/**
 * GameUnit
 * ---
 * A battlefield's unit
 */
export class GameUnit implements WithState<UnitState>, WithData<UnitData, UnitType> {
    readonly id: string;

    readonly map: GameMap;
    readonly army: GameArmy;

    readonly type: UnitType;

    x: number;
    y: number;

    fuel: number;
    ammo: number;

    active: boolean;

    constructor(
        readonly battlefield: GameBattlefield, //
        state: UnitState,
    ) {
        this.map = battlefield.map;
        this.army = battlefield.armies.find((t) => t.id === state.armyId)!;

        this.id = state.id ?? `${state.type}_${battlefield.uid()}`;
        this.type = state.type;

        this.x = state.x;
        this.y = state.y;

        this.fuel = state.fuel ?? this.data.initialFuel;
        this.ammo = state.ammo ?? this.data.initialAmmo ?? Infinity;

        this.active = state.active ?? true;

        this.army.units.push(this);
        this.map.at(this.pos).unit = this;
    }

    get state(): UnitState {
        return {
            id: this.id,
            armyId: this.army.id,
            type: this.type,
            x: this.x,
            y: this.y,
            hp: this.hp,
            fuel: this.fuel,
            ammo: this.ammo,
            active: this.active,
        };
    }

    get data(): UnitData {
        return UnitsData[this.type];
    }

    canCapture(): boolean {
        return canCaptureUnits.includes(this.type);
    }

    canAttack(defender: UnitType): boolean {
        const [primaryDamage, secondaryDamage] = getBaseDamages(this.ammo > 0, this.type, defender);
        return primaryDamage + secondaryDamage > 0;
    }

    isIndirect(): boolean {
        const [min, _] = this.data.attackRange ?? [1, 1];
        return min > 1;
    }

    #hp = 100;
    get hp(): number {
        return this.#hp;
    }
    set hp(value: number) {
        this.#hp = Math.max(0, Math.min(value, 100));
    }

    get visualHP() {
        return Math.ceil(this.hp / 10);
    }

    isDead() {
        return this.hp < 1;
    }

    isAllied(army: GameArmy) {
        return this.army === army;
    }

    get pos(): Coordinates {
        return [this.x, this.y];
    }

    get tile(): GameTile {
        return this.map.at(this.pos);
    }

    moveTo([x, y]: Coordinates) {
        this.tile.unit = null;
        this.map.at([x, y]).unit = this;
        this.x = x;
        this.y = y;
    }

    remove() {
        this.tile.unit = null;
        removeFrom(this, this.army.units);
        removeFrom(this, this.battlefield.units);
    }
}
