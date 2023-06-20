import type { UnitType } from '../engine/data/unit';

export type WaitAction = {
    readonly type: 'wait';
};

export const AbilityKinds = ['capture', 'supply', 'repair', 'explode', 'hide', 'show'] as const;
export type AbilityKind = (typeof AbilityKinds)[number];

export type AbilityAction = {
    readonly type: 'ability';
    readonly kind: AbilityKind;
};

export type LaunchMissileAction = {
    readonly type: 'launch';
    readonly targetPosition: readonly [number, number];
};

export type LoadAction = {
    readonly type: 'load';
    readonly targetId: string;
};

export type UnloadAction = {
    readonly type: 'unload';
    readonly unloads: readonly {
        readonly unitId: string;
        readonly position: readonly [number, number];
    }[];
};

export type AttackAction = {
    readonly type: 'attack';
    readonly targetId: string;
};

export type RepairAction = {
    readonly type: 'repair';
    readonly targetId: string;
};

export type SecondaryAction =
    | WaitAction //
    | AbilityAction
    | LaunchMissileAction
    | LoadAction
    | UnloadAction
    | AttackAction
    | RepairAction;

export type MoveAction = {
    readonly type: 'move';
    readonly unitId: string;
    readonly path: readonly (readonly [number, number])[];
    readonly then: SecondaryAction;
};

export type UnitAction = MoveAction | (SecondaryAction & { readonly unitId: string });

export type BuildAction = {
    readonly type: 'build';
    readonly propertyId: string;
    readonly unitType: UnitType;
};

export type CoPowerAction = {
    readonly type: 'co-power';
};

export type CoSuperPowerAction = {
    readonly type: 'co-super-power';
};

export type EndTurnAction = {
    readonly type: 'end-turn';
};

export type ForfeitAction = {
    readonly type: 'forfeit';
    readonly armyId: string;
};

export type TeamAction =
    | CoPowerAction //
    | CoSuperPowerAction
    | EndTurnAction
    | ForfeitAction;

export type GameAction =
    | UnitAction //
    | BuildAction
    | TeamAction;
