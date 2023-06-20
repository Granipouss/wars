export const COTypes = [
    //
    'Adder',
    'Andy',
    'Colin',
    'Drake',
    'Eagle',
    'Flak',
    'Grimm',
    'Grit',
    'Hachi',
    'Hawke',
    'Jake',
    'Javier',
    'Jess',
    'Jugger',
    'Kanbei',
    'Kindle',
    'Koal',
    'Lash',
    'Max',
    'Nell',
    'Olaf',
    'Rachel',
    'Sami',
    'Sasha',
    'Sensei',
    'Sonja',
    'Sturm',
    'Von Bolt',
] as const;

export type COType = (typeof COTypes)[number];

export const CountryTypes = [
    //
    'Orange Star',
    'Blue Moon',
    'Green Earth',
    'Yellow Comet',
    'Black Hole',
] as const;

export type CountryType = (typeof CountryTypes)[number];

export type PowerData = {
    readonly name: string;
    readonly power: number;
};

export type COData = {
    readonly type: COType;
    readonly country: CountryType;
    readonly powers: readonly [PowerData | null, PowerData | null];
};

export const COsData: Record<COType, COData> = {
    Adder: {
        type: 'Adder',
        country: 'Black Hole',
        powers: [
            { name: 'Sideslip', power: 2 },
            { name: 'Sidewinder', power: 5 },
        ],
    },
    Andy: {
        type: 'Andy',
        country: 'Orange Star',
        powers: [
            { name: 'Hyper Repair', power: 3 },
            { name: 'Hyper Upgrade', power: 6 },
        ],
    },
    Colin: {
        type: 'Colin',
        country: 'Blue Moon',
        powers: [
            { name: 'Gold Rush', power: 2 },
            { name: 'Power of Money', power: 6 },
        ],
    },
    Drake: {
        type: 'Drake',
        country: 'Green Earth',
        powers: [
            { name: 'Tsunami', power: 4 },
            { name: 'Typhoon', power: 7 },
        ],
    },
    Eagle: {
        type: 'Eagle',
        country: 'Green Earth',
        powers: [
            { name: 'Lightning Drive', power: 3 },
            { name: 'Lightning Strike', power: 9 },
        ],
    },
    Flak: {
        type: 'Flak',
        country: 'Black Hole',
        powers: [
            { name: 'Brute Force', power: 3 },
            { name: 'Barbaric Blow', power: 6 },
        ],
    },
    Grimm: {
        type: 'Grimm',
        country: 'Yellow Comet',
        powers: [
            { name: 'Knuckleduster', power: 3 },
            { name: 'Haymaker', power: 6 },
        ],
    },
    Grit: {
        type: 'Grit',
        country: 'Blue Moon',
        powers: [
            { name: 'Snipe Attack', power: 3 },
            { name: 'Super Snipe', power: 6 },
        ],
    },
    Hachi: {
        type: 'Hachi',
        country: 'Orange Star',
        powers: [
            { name: 'Barter', power: 3 },
            { name: 'Merchant Union', power: 5 },
        ],
    },
    Hawke: {
        type: 'Hawke',
        country: 'Black Hole',
        powers: [
            { name: 'Black Wave', power: 5 },
            { name: 'Black Storm', power: 9 },
        ],
    },
    Jake: {
        type: 'Jake',
        country: 'Orange Star',
        powers: [
            { name: 'Beat Down', power: 3 },
            { name: 'Block Rock', power: 6 },
        ],
    },
    Javier: {
        type: 'Javier',
        country: 'Green Earth',
        powers: [
            { name: 'Tower Shield', power: 3 },
            { name: 'Tower of Power', power: 6 },
        ],
    },
    Jess: {
        type: 'Jess',
        country: 'Green Earth',
        powers: [
            { name: 'Turbo Charge', power: 3 },
            { name: 'Overdrive', power: 6 },
        ],
    },
    Jugger: {
        type: 'Jugger',
        country: 'Black Hole',
        powers: [
            { name: 'Overclock', power: 3 },
            { name: 'System Crash', power: 7 },
        ],
    },
    Kanbei: {
        type: 'Kanbei',
        country: 'Yellow Comet',
        powers: [
            { name: 'Morale Boost', power: 4 },
            { name: 'Samurai Spirit', power: 7 },
        ],
    },
    Kindle: {
        type: 'Kindle',
        country: 'Black Hole',
        powers: [
            { name: 'Urban Blight', power: 3 },
            { name: 'High Society', power: 6 },
        ],
    },
    Koal: {
        type: 'Koal',
        country: 'Black Hole',
        powers: [
            { name: 'Forced March', power: 3 },
            { name: 'Trail of Woe', power: 5 },
        ],
    },
    Lash: {
        type: 'Lash',
        country: 'Black Hole',
        powers: [
            { name: 'Terrain Tactics', power: 4 },
            { name: 'Prime Tactics', power: 7 },
        ],
    },
    Max: {
        type: 'Max',
        country: 'Orange Star',
        powers: [
            { name: 'Max Force', power: 3 },
            { name: 'Max Blast', power: 6 },
        ],
    },
    Nell: {
        type: 'Nell',
        country: 'Orange Star',
        powers: [
            { name: 'Lady Luck', power: 3 },
            { name: 'Lucky Star', power: 6 },
        ],
    },
    Olaf: {
        type: 'Olaf',
        country: 'Blue Moon',
        powers: [
            { name: 'Blizzard', power: 3 },
            { name: 'Winter Fury', power: 7 },
        ],
    },
    Rachel: {
        type: 'Rachel',
        country: 'Orange Star',
        powers: [
            { name: 'Lucky Lass', power: 3 },
            { name: 'Covering Fire', power: 6 },
        ],
    },
    Sami: {
        type: 'Sami',
        country: 'Orange Star',
        powers: [
            { name: 'Double Time', power: 3 },
            { name: 'Victory March', power: 8 },
        ],
    },
    Sasha: {
        type: 'Sasha',
        country: 'Blue Moon',
        powers: [
            { name: 'Market Crash', power: 2 },
            { name: 'War Bonds', power: 6 },
        ],
    },
    Sensei: {
        type: 'Sensei',
        country: 'Yellow Comet',
        powers: [
            { name: 'Copter Command', power: 2 },
            { name: 'Airborne Assault', power: 6 },
        ],
    },
    Sonja: {
        type: 'Sonja',
        country: 'Yellow Comet',
        powers: [
            { name: 'Enhanced Vision', power: 3 },
            { name: 'Counter Break', power: 5 },
        ],
    },
    Sturm: {
        type: 'Sturm',
        country: 'Black Hole',
        powers: [
            { name: 'Meteor Strike I', power: 6 },
            { name: 'Meteor Strike II', power: 10 },
        ],
    },
    'Von Bolt': {
        type: 'Von Bolt',
        country: 'Black Hole',
        powers: [null, { name: 'Ex Machina', power: 10 }],
    },
};
