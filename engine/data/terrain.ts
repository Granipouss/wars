import type { MovementType } from './enums';

export const TerrainTypes = [
    'sea',
    'pipe',
    'base',
    'airport',
    'port',
    'hq',
    'lab',
    'comtower',
    'city',
    'shoal',
    'forest',
    'mountain',
    'reef',
    'usedSilo',
    'unusedSilo',
    'road',
    'bridge',
    'pipeSeam',
    'river',
    'plain',
] as const;

export type TerrainType = (typeof TerrainTypes)[number];

export type MovementCosts = { readonly [type in MovementType]: number | null };

export interface TerrainData {
    readonly type: TerrainType;

    /** A nonzero integer (or null for impassible) for every possible "movement type". */
    readonly movementCosts: MovementCosts;

    /** An integer from 0 to 4 which modifies the amount of damage a unit on this tile takes from attacks. */
    readonly defenseStars: number;
}

const baseMovementCosts: MovementCosts = {
    foot: null,
    boots: null,
    treads: null,
    tires: null,
    pipe: null,
    lander: null,
    sea: null,
    air: 1,
};

const manMadeMovementCosts = {
    ...baseMovementCosts,
    foot: 1,
    boots: 1,
    treads: 1,
    tires: 1,
};

export const TerrainsData: Record<TerrainType, TerrainData> = {
    plain: {
        type: 'plain',
        defenseStars: 1,
        movementCosts: {
            ...baseMovementCosts,
            foot: 1,
            boots: 1,
            treads: 1,
            tires: 2,
        },
    },
    forest: {
        type: 'forest',
        defenseStars: 2,
        movementCosts: {
            ...baseMovementCosts,
            foot: 1,
            boots: 1,
            treads: 2,
            tires: 3,
        },
    },
    mountain: {
        type: 'mountain',
        defenseStars: 4,
        movementCosts: {
            ...baseMovementCosts,
            foot: 2,
            boots: 1,
        },
    },
    river: {
        type: 'river',
        defenseStars: 0,
        movementCosts: {
            ...baseMovementCosts,
            foot: 2,
            boots: 1,
        },
    },
    road: {
        type: 'road',
        defenseStars: 0,
        movementCosts: {
            ...manMadeMovementCosts,
        },
    },
    sea: {
        type: 'sea',
        defenseStars: 0,
        movementCosts: {
            ...baseMovementCosts,
            sea: 1,
            lander: 1,
        },
    },
    shoal: {
        type: 'shoal',
        defenseStars: 0,
        movementCosts: {
            ...baseMovementCosts,
            boots: 1,
            foot: 1,
            treads: 1,
            tires: 1,
            // This is a beach, so navy *transports* can go here
            // but no other navy units!
            lander: 1,
        },
    },
    reef: {
        type: 'reef',
        defenseStars: 1,
        movementCosts: {
            ...baseMovementCosts,
            sea: 2,
            lander: 2,
        },
    },
    pipe: {
        type: 'pipe',
        defenseStars: 0,
        movementCosts: {
            ...baseMovementCosts,
            air: 0,
            pipe: 1,
        },
    },
    pipeSeam: {
        type: 'pipeSeam',
        defenseStars: 0,
        movementCosts: {
            ...baseMovementCosts,
            air: 0,
            pipe: 1,
        },
    },
    base: {
        type: 'base',
        defenseStars: 3,
        movementCosts: {
            ...manMadeMovementCosts,
            pipe: 1,
        },
    },
    port: {
        type: 'port',
        defenseStars: 3,
        movementCosts: {
            ...manMadeMovementCosts,
            // Any building which *could have* produced a unit has
            // a movement cost of 1 for that unit.
            // Ports build ships.
            sea: 1,
            lander: 1,
        },
    },
    airport: {
        type: 'airport',
        defenseStars: 3,
        movementCosts: {
            ...manMadeMovementCosts,
        },
    },
    city: {
        type: 'city',
        defenseStars: 3,
        movementCosts: {
            ...manMadeMovementCosts,
        },
    },
    hq: {
        type: 'hq',
        defenseStars: 4,
        movementCosts: {
            ...manMadeMovementCosts,
        },
    },
    bridge: {
        type: 'bridge',
        defenseStars: 0,
        movementCosts: {
            ...manMadeMovementCosts,
        },
    },
    lab: {
        type: 'lab',
        defenseStars: 3,
        movementCosts: {
            ...manMadeMovementCosts,
        },
    },
    comtower: {
        type: 'comtower',
        defenseStars: 3,
        movementCosts: {
            ...manMadeMovementCosts,
        },
    },
    unusedSilo: {
        type: 'unusedSilo',
        defenseStars: 3,
        movementCosts: {
            ...manMadeMovementCosts,
        },
    },
    usedSilo: {
        type: 'usedSilo',
        defenseStars: 3,
        movementCosts: {
            ...manMadeMovementCosts,
        },
    },
};
