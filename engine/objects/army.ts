import type { GameBattlefield } from '../game.battlefield';
import { COState, GameCO } from './commanding-officer';
import type { GameProperty } from './property';
import { WithState } from './types';
import type { GameUnit } from './unit';
import { GameWarFog } from './warfog';

export const ArmyColors = ['red', 'blue', 'yellow', 'green', 'black'] as const;
export type ArmyColor = (typeof ArmyColors)[number];

export const ArmyStatuses = ['playing', 'forfeited', 'loser', 'winner', 'tied'] as const;
export type ArmyStatus = (typeof ArmyStatuses)[number];

export type ArmyState = {
    readonly id?: string;
    readonly co: COState;
    readonly color: ArmyColor;
    readonly funds?: number;
    readonly status?: ArmyStatus;
    readonly warfog?: boolean;
};

/**
 * GameArmy
 * ---
 * A battlefield's army
 */
export class GameArmy implements WithState<ArmyState> {
    readonly id: string;
    readonly color: ArmyColor;

    funds: number;
    status: ArmyStatus;
    warfog: GameWarFog | null;

    co: GameCO;

    properties: GameProperty[] = [];
    units: GameUnit[] = [];

    constructor(
        readonly battlefield: GameBattlefield, //
        state: ArmyState,
    ) {
        this.id = state.id ?? `army_${state.color}_${battlefield.uid()}`;
        this.color = state.color;

        this.co = new GameCO(this, state.co);

        this.funds = state.funds ?? 1000;
        this.status = state.status ?? 'playing';
        this.warfog = state.warfog ? new GameWarFog(battlefield, this) : null;
    }

    get state(): ArmyState {
        return {
            id: this.id,
            color: this.color,
            co: this.co.state,
            funds: this.funds,
            status: this.status,
            warfog: !!this.warfog,
        };
    }

    checkForLoss(): boolean {
        return this.units.length === 0;
    }

    isPlaying(): boolean {
        return this.status === 'playing';
    }
}
