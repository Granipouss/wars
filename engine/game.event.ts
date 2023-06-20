import { BattlefieldState } from './game.battlefield';
import { UnitState } from './objects/unit';

// = EndGameEvent ===

export type WinEvent = {
    readonly type: 'win';
    readonly armyId: string;
};

export type LossEvent = {
    readonly type: 'loss';
    readonly armyId: string;
};

export type TieEvent = {
    readonly type: 'tie';
};

export type EndGameEvent = WinEvent | TieEvent | LossEvent;

// = StateEvent ===

export type StateEvent = {
    readonly type: 'state';
    readonly state: BattlefieldState;
};

// = TeamEvent ===

export type ForfeitEvent = {
    readonly type: 'forfeit';
    readonly armyId: string;
};

export type TurnStartEvent = {
    readonly type: 'turn';
    readonly turn: number;
};

export type BuildEvent = {
    readonly type: 'build';
    readonly unit: UnitState;
};

export type TeamEvent = ForfeitEvent | TurnStartEvent | BuildEvent;

// = UnitEvent ===

export type WaitEvent = {
    readonly type: 'wait';
    readonly unitId: string;
};

export type AttackEvent = {
    readonly type: 'attack';
    readonly attackerId: string;
    readonly defenderId: string;
    readonly damage: number;
    readonly usedAmmo: number;
};

export type DeathEvent = {
    readonly type: 'death';
    readonly unitId: string;
};

export type EmbushEvent = {
    readonly type: 'embush';
    readonly unitId: string;
};

export type MoveEvent = {
    readonly type: 'move';
    readonly unitId: string;
    readonly path: readonly (readonly [number, number])[];
};

export type UnitEvent = MoveEvent | EmbushEvent | WaitEvent | AttackEvent | DeathEvent;

// = WarfogEvent ===

export type EnterFogEvent = {
    readonly type: 'enter-fog';
    readonly unitId: string;
};

export type LeaveFogEvent = {
    readonly type: 'leave-fog';
    readonly unit: UnitState;
};

export type WarfogEvent = EnterFogEvent | LeaveFogEvent;

// = GameEvent ===

export type GameEvent =
    | EndGameEvent //
    | StateEvent
    | TeamEvent
    | UnitEvent
    | WarfogEvent;
