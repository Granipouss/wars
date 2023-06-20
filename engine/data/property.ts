import type { MovementType } from './enums';

export const PropertyTypes = [
    //
    'airport',
    'base',
    'city',
    'port',
    'comtower',
    'lab',
    'hq',
] as const;

export type PropertyType = (typeof PropertyTypes)[number];

export interface PropertyData {
    readonly type: PropertyType;
    readonly providesFunds: boolean;
    readonly resuppliedMovementTypes: readonly MovementType[];
}

const movementTypesThatGetResuppliedByBases: MovementType[] = ['boots', 'foot', 'pipe', 'tires', 'treads'];

export const PropertiesData: Record<PropertyType, PropertyData> = {
    airport: {
        type: 'airport',
        providesFunds: true,
        resuppliedMovementTypes: ['air'],
    },
    base: {
        type: 'base',
        providesFunds: true,
        resuppliedMovementTypes: movementTypesThatGetResuppliedByBases,
    },
    city: {
        type: 'city',
        providesFunds: true,
        resuppliedMovementTypes: movementTypesThatGetResuppliedByBases, // pipes can't move here so no need for an exception
    },
    port: {
        type: 'port',
        providesFunds: true,
        resuppliedMovementTypes: ['sea', 'lander'],
    },
    comtower: {
        type: 'comtower',
        providesFunds: false,
        resuppliedMovementTypes: [],
    },
    lab: {
        type: 'lab',
        providesFunds: false,
        resuppliedMovementTypes: [],
    },
    hq: {
        type: 'hq',
        providesFunds: true,
        resuppliedMovementTypes: movementTypesThatGetResuppliedByBases,
    },
};
