import { COData, COType, COsData } from '../data/commanding-officer';
import { GameArmy } from './army';
import type { WithData, WithState } from './types';

export type COState = {
    readonly type: COType;
    readonly power?: number;
};

/**
 * GameCO
 * ---
 * An Army's Commanding Officer
 */
export class GameCO implements WithState<COState>, WithData<COData, COType> {
    readonly type: COType;

    power: number;

    constructor(
        readonly army: GameArmy, //
        state: COState,
    ) {
        this.type = state.type;
        this.power = state.power ?? 0;
    }

    get state(): COState {
        return {
            type: this.type,
            power: this.power,
        };
    }

    get data(): COData {
        return COsData[this.type];
    }
}
