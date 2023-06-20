import { Coordinates, GameMap, GameWarFog, TerrainType } from '../../engine';
import { makeArea } from '../../engine/utils';
import { BaseSprite } from './base';
import { AnimationFrames, TileSize } from './constants';
import { BaseTexture, Rectangle, Sprite, Texture, autoDetectRenderer } from 'pixi.js';

const TilesTextures: Record<string, Texture> = {};
{
    const baseTexture = BaseTexture.from('img/terrain-normal.png');

    type Tile = [string, Coordinates];

    const makeAutoSquare = (type: string, [x, y]: Coordinates): Tile[] => [
        [`${type}-ES`, [x, y]],
        [`${type}-ESW`, [x + 1, y]],
        [`${type}-SW`, [x + 2, y]],
        [`${type}-NES`, [x, y + 1]],
        [`${type}-NESW`, [x + 1, y + 1]],
        [`${type}-NSW`, [x + 2, y + 1]],
        [`${type}-NE`, [x, y + 2]],
        [`${type}-NEW`, [x + 1, y + 2]],
        [`${type}-NW`, [x + 2, y + 2]],
    ];

    const withoutShadow: Tile[] = [
        //
        ['plain', [0, 0]],
        ...makeAutoSquare('road', [1, 0]),
        ['road-EW', [2, 3]],
        ['road-NS', [3, 3]],
    ];

    const withShadow = withoutShadow.map(([type, [x, y]]): Tile => [type + '-shadow', [x + 4, y]]);

    const pipeOn: Tile[] = [
        ['pipe-NE-on', [8, 1]],
        ['pipeSeam-EW-on', [9, 1]],
        ['pipe-NW-on', [10, 1]],
        ['pipe-E-on', [8, 2]],
        ['pipe-EW-on', [9, 2]],
        ['pipe-W-on', [10, 2]],
    ];

    const pipeOff = pipeOn.map(([type, [x, y]]): Tile => [type.replace(/-on/, '-off'), [x + 4, y]]);

    const seaSeaLinks = [
        ['ES', 'ESW', 'SW', 'S', 'NESW', 'NESW', 'NES', 'NSW', 'NESW', 'NESW', 'NESW', 'NESW'],
        ['NES', 'NESW', 'NSW', 'NS', 'NESW', 'NESW', 'NES', 'NSW', 'NESW', 'NESW', 'NESW', 'NESW'],
        ['NE', 'NEW', 'NW', 'N', 'ES', 'SW', 'NES', 'NSW', 'ESW', 'ESW', 'ESW', 'NESW'],
        ['E', 'EW', 'W', '', 'NE', 'NW', 'NESW', 'NESW', 'NEW', 'NEW', 'NEW', 'X'],
    ];
    const seaCorners = [
        ['', '', '', '', 'b', 'c', 'b', 'c', 'ad', 'ab', 'abc', 'cbd'],
        ['', '', '', '', 'a', 'd', 'ab', 'cd', 'cd', 'bc', 'abd', 'acd'],
        ['', '', '', '', 'b', 'c', 'a', 'c', 'b', 'bc', 'c', 'abcd'],
        ['', '', '', '', 'a', 'd', 'bd', 'ac', 'a', 'ad', 'd', 'X'],
    ];
    const seaTiles = makeArea(12, 4).map(
        ([x, y]): Tile => [
            `sea-${seaSeaLinks[y][x]}-${seaCorners[y][x]}`.replace(/-+/g, '-').replace(/-$/, ''),
            [x, 4 + y],
        ],
    );

    const shoalSeaLinks = [
        ['NSW', 'NES', 'NEW', 'NEW', 'NEW', 'NEW', 'NW', 'NE', 'E'],
        ['NSW', 'NES', 'ESW', 'ESW', 'ESW', 'ESW', 'SW', 'ES', 'W'],
        ['NSW', 'NES', 'NE', 'NW', 'SW', 'NE', 'ES', 'SW', 'N'],
        ['NSW', 'NES', 'SE', 'SW', 'NW', 'ES', 'NE', 'NW', 'S'],
    ];
    const shoalShoalLinks = [
        ['S', 'S', 'E', 'EW', 'W', '', '', '', ''],
        ['NS', 'NS', 'E', 'EW', 'W', '', '', '', ''],
        ['N', 'N', 'E', 'W', 'S', 'S', 'ES', 'SW', ''],
        ['', '', 'E', 'W', 'N', 'N', 'NE', 'NW', ''],
    ];
    const shoalTiles = makeArea(9, 4).map(
        ([x, y]): Tile => [`shoal-${shoalSeaLinks[y][x]}-${shoalShoalLinks[y][x]}`, [12 + x, 4 + y]],
    );

    const baseWater: Tile[] = [
        ...seaTiles,
        ...makeAutoSquare('river', [21, 4]),
        ...shoalTiles,
        ['river-S', [24, 4]],
        ['river-NS', [24, 5]],
        ['river-N', [24, 6]],
        ['river-E', [21, 7]],
        ['river-EW', [22, 7]],
        ['river-W', [23, 7]],
    ];

    const tiles: Tile[] = [
        //
        ...withoutShadow,
        ...withShadow,
        ['bridge-EW', [4, 3]],
        ['bridge-NS', [5, 3]],
        ...pipeOn,
        ...pipeOff,
        ['pipe-ES', [8, 0]],
        ['pipeSeam-NS', [9, 0]],
        ['pipe-WS', [10, 0]],
        ['pipe-S', [11, 0]],
        ['pipe-NS', [11, 1]],
        ['pipe-N', [11, 2]],
        ...baseWater.map(([type, [x, y]]): Tile => [type + '-1', [x, y]]),
        ...baseWater.map(([type, [x, y]]): Tile => [type + '-2', [x, y + 4]]),
        ...baseWater.map(([type, [x, y]]): Tile => [type + '-3', [x, y + 8]]),
        ...baseWater.map(([type, [x, y]]): Tile => [type + '-4', [x, y + 12]]),
    ];

    tiles.forEach(([type, [x, y]]) => {
        TilesTextures[type] = new Texture(baseTexture, new Rectangle(16 * x, 16 * y, 16, 16));
        TilesTextures[type + '-fog'] = new Texture(baseTexture, new Rectangle(16 * (x + 25), 16 * y, 16, 16));
    });

    const doubleTiles: Tile[] = [
        ['unusedSilo', [16, 1]],
        ['usedSilo', [17, 1]],
        ['forest', [18, 1]],
        ['forest-shadow', [19, 1]],
        ['mountain-A', [20, 1]],
        ['mountain-B', [21, 1]],
        ['mountain-C', [22, 1]],
    ];

    doubleTiles.forEach(([type, [x, y]]) => {
        TilesTextures[type] = new Texture(baseTexture, new Rectangle(16 * x, 16 * y, 16, 32));
        TilesTextures[type + '-fog'] = new Texture(baseTexture, new Rectangle(16 * (x + 25), 16 * y, 16, 32));
    });
}

const hasShadow = (pos: Coordinates, map: GameMap): boolean => {
    if (!map.isValid(pos)) return false;
    return ['base', 'airport', 'port', 'hq', 'lab', 'comtower', 'city', 'forest', 'mountain', 'unusedSilo'].includes(
        map.at(pos).type,
    );
};

const makeLinker =
    (map: GameMap, types: TerrainType[], linkOut = true) =>
    (pos: Coordinates) => {
        if (!map.isValid(pos)) return linkOut;
        return types.includes(map.at(pos).type);
    };

const getTexture = (...parts: (string | number)[]) => {
    const type = parts.join('-').replace(/-+/g, '-').replace(/-$/, '');
    return TilesTextures[type];
};

const getSeaTileTexture = ([x, y]: Coordinates, map: GameMap, frame = 1, fog = false): Texture => {
    const isLinked = makeLinker(map, ['sea', 'reef', 'river', 'shoal'], true);
    const dirs: string[] = [];
    if (isLinked([x, y - 1])) dirs.push('N');
    if (isLinked([x + 1, y])) dirs.push('E');
    if (isLinked([x, y + 1])) dirs.push('S');
    if (isLinked([x - 1, y])) dirs.push('W');
    const corners: string[] = [];
    if (!dirs.includes('N') && !dirs.includes('E') && isLinked([x + 1, y - 1])) corners.push('a');
    if (!dirs.includes('E') && !dirs.includes('S') && isLinked([x + 1, y + 1])) corners.push('b');
    if (!dirs.includes('S') && !dirs.includes('W') && isLinked([x - 1, y + 1])) corners.push('c');
    if (!dirs.includes('W') && !dirs.includes('N') && isLinked([x - 1, y - 1])) corners.push('d');
    return getTexture('sea', dirs.join(''), corners.join(''), frame, fog ? 'fog' : '');
};

const getShoalTileTexture = ([x, y]: Coordinates, map: GameMap, frame = 1, fog = false): Texture => {
    const isSeaLinked = makeLinker(map, ['sea', 'reef', 'shoal'], true);
    const seaDirs: string[] = [];
    if (isSeaLinked([x, y - 1])) seaDirs.push('N');
    if (isSeaLinked([x + 1, y])) seaDirs.push('E');
    if (isSeaLinked([x, y + 1])) seaDirs.push('S');
    if (isSeaLinked([x - 1, y])) seaDirs.push('W');
    const isShoalLinked = makeLinker(map, ['shoal'], false);
    const shoalDirs: string[] = [];
    if (isShoalLinked([x, y - 1])) shoalDirs.push('N');
    if (isShoalLinked([x + 1, y])) shoalDirs.push('E');
    if (isShoalLinked([x, y + 1])) shoalDirs.push('S');
    if (isShoalLinked([x - 1, y])) shoalDirs.push('W');
    return getTexture('shoal', seaDirs.join(''), shoalDirs.join(''), frame, fog ? 'fog' : '');
};

const getRiverTileTexture = ([x, y]: Coordinates, map: GameMap, frame = 1, fog = false): Texture => {
    const dirs: string[] = [];
    const isLinked = makeLinker(map, ['river'], false);
    if (isLinked([x, y - 1])) dirs.push('N');
    if (isLinked([x + 1, y])) dirs.push('E');
    if (isLinked([x, y + 1])) dirs.push('S');
    if (isLinked([x - 1, y])) dirs.push('W');
    let dir = dirs.join('');
    if (['N', 'S'].includes(dir)) dir = 'NS';
    if (['E', 'W'].includes(dir)) dir = 'EW';
    return getTexture('river', dir, frame, fog ? 'fog' : '');
};

const getPipeTileTexture = ([x, y]: Coordinates, map: GameMap, frame = 1, fog = false): Texture => {
    const dirs: string[] = [];
    const isLinked = makeLinker(map, ['pipe', 'pipeSeam'], false);
    if (isLinked([x, y - 1])) dirs.push('N');
    if (isLinked([x + 1, y])) dirs.push('E');
    if (isLinked([x, y + 1])) dirs.push('S');
    if (isLinked([x - 1, y])) dirs.push('W');
    const isOn = frame % 4 < 2;
    return getTexture('pipe', dirs.slice(0, 2).join(''), isOn ? 'on' : 'off', fog ? 'fog' : '');
};

const getRoadTileTexture = ([x, y]: Coordinates, map: GameMap, fog = false): Texture => {
    const shadow = hasShadow([x - 1, y], map);
    const dirs: string[] = [];
    const isLinked = makeLinker(map, ['road', 'bridge'], false);
    if (isLinked([x, y - 1])) dirs.push('N');
    if (isLinked([x + 1, y])) dirs.push('E');
    if (isLinked([x, y + 1])) dirs.push('S');
    if (isLinked([x - 1, y])) dirs.push('W');
    let dir = dirs.join('');
    if (['N', 'S'].includes(dir)) dir = 'NS';
    if (['E', 'W'].includes(dir)) dir = 'EW';
    return getTexture('road', dir, shadow ? 'shadow' : '', fog ? 'fog' : '');
};

const getTileTexture = ([x, y]: Coordinates, map: GameMap, frame = 1, fog = false): Texture => {
    switch (map.at([x, y]).type) {
        case 'sea': {
            return getSeaTileTexture([x, y], map, frame, fog);
        }
        case 'shoal': {
            return getShoalTileTexture([x, y], map, frame, fog);
        }
        case 'river': {
            return getRiverTileTexture([x, y], map, frame, fog);
        }
        case 'pipe': {
            return getPipeTileTexture([x, y], map, frame, fog);
        }
        case 'road': {
            return getRoadTileTexture([x, y], map, fog);
        }
        case 'pipeSeam': {
            const isLinked = makeLinker(map, ['pipe', 'pipeSeam'], true);
            const isHorizontal = isLinked([x - 1, y]) || isLinked([x + 1, y]);
            const isOn = frame % 4 < 2;
            return getTexture('pipeSeam', isHorizontal ? 'EW' : 'NS', isOn ? 'on' : 'off', fog ? '-fog' : '');
        }
        case 'bridge': {
            const isLinked = makeLinker(map, ['river'], true);
            const isHorizontal = isLinked([x - 1, y]) || isLinked([x + 1, y]);
            return getTexture('bridge', !isHorizontal ? 'EW' : 'NS', fog ? '-fog' : '');
        }
        case 'base':
        case 'airport':
        case 'port':
        case 'hq':
        case 'lab':
        case 'comtower':
        case 'city':
        case 'usedSilo':
        case 'unusedSilo':
        case 'plain': {
            const shadow = hasShadow([x - 1, y], map);
            return getTexture('plain', shadow ? '-shadow' : '', fog ? '-fog' : '');
        }
        case 'forest': {
            const shadow = hasShadow([x - 1, y], map);
            return getTexture('forest', shadow ? '-shadow' : '', fog ? '-fog' : '');
        }
        case 'mountain': {
            return getTexture('mountain', ['A', 'B', 'C'][(x + y) % 3], fog ? '-fog' : '');
        }
        case 'reef': {
            return getTexture('reef', frame, fog ? '-fog' : '');
        }
    }
};

const renderer = autoDetectRenderer();

export class MapLayerSprite extends BaseSprite {
    constructor(readonly map: GameMap, y: number, readonly warfog?: GameWarFog) {
        super();

        for (let x = 0; x < map.width; x++) {
            const tile = map.at([x, y]);
            const texture = getTileTexture(tile.pos, map, 1);
            const sprite = new Sprite(texture);
            sprite.anchor.set(0, 1);
            sprite.position.set(TileSize * tile.x, TileSize);
            this.addChild(sprite);

            this.everyNthFrame((frame) => {
                frame = 1 + (frame % 4);
                const fog = warfog?.at([x, y]) ?? false;
                sprite.texture = getTileTexture(tile.pos, map, frame, fog);
            }, AnimationFrames);
        }

        this.y = TileSize * y;
        this.zIndex = TileSize * y;
    }
}
