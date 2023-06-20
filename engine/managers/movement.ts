import { MovementType, WeatherType } from '../data/enums';
import { TerrainType, TerrainsData } from '../data/terrain';
import { GameException } from '../game.exception';
import { Coordinates, dist } from '../objects/coordinates';
import type { GameUnit } from '../objects/unit';

/**
 * See https://awbw.fandom.com/wiki/Units#Movement for more details.
 */
export const getMovementCost = (terrain: TerrainType, movementType: MovementType, weather: WeatherType): number => {
    const clearMovementCost = TerrainsData[terrain].movementCosts[movementType];

    // impassible terrain remains impassible regardless of weather
    if (clearMovementCost === null) {
        return Infinity;
    }

    switch (weather) {
        case 'clear': {
            return clearMovementCost;
        }
        case 'rain': {
            if (['plain', 'forest'].includes(terrain) && ['treads', 'tires'].includes(movementType)) {
                return clearMovementCost + 1;
            }
            return clearMovementCost;
        }
        case 'snow': {
            if (movementType === 'air') {
                return clearMovementCost * 2;
            }
            if (terrain === 'plain' && ['foot', 'tires', 'treads'].includes(movementType)) {
                return clearMovementCost + 1;
            }
            if (terrain === 'forest' && ['foot', 'boots'].includes(movementType)) {
                return clearMovementCost + 1;
            }
            if (terrain === 'mountain' && ['foot', 'boots'].includes(movementType)) {
                return clearMovementCost * 2;
            }
            if (['sea', 'port'].includes(terrain) && ['sea', 'lander'].includes(movementType)) {
                return clearMovementCost + 1;
            }
            return clearMovementCost;
        }
    }
};

export const checkPathValidity = (
    unit: Readonly<GameUnit>,
    path: readonly Coordinates[],
): [boolean, readonly Coordinates[]] => {
    if (path.length === 0) return [true, path];
    if (dist(path[0], unit.pos) > 1) throw new GameException('Path should start at the unit position.');

    const {
        battlefield: { weather },
        map,
    } = unit;

    for (let i = 0; i < path.length - 1; i++) {
        const A = path[i];
        const B = path[i + 1];
        if (dist(A, B) !== 1) throw new GameException('The path is not contiguous.');
    }

    let cost = 0;
    for (let i = 1; i < path.length; i++) {
        const pos = path[i];
        if (!map.isValid(pos)) throw new GameException('Path goes out of the map.');
        const tile = map.at(pos);
        cost += getMovementCost(tile.type, unit.data.movementType, weather);
    }

    if (cost > unit.data.moveRange) throw new GameException('Path is too long.');

    {
        const target = path[path.length - 1];
        const tile = map.at(target);
        if (tile.unit && tile.unit !== unit) throw new GameException('Path ends on an occupied tile.');
    }

    // The path is valid, now check for embush

    for (let i = 0; i < path.length; i++) {
        const tile = map.at(path[i]);
        if (tile.unit && !tile.unit.isAllied(unit.army)) {
            return [false, path.slice(0, i - 1)];
        }
    }
    return [true, path];
};

const fromCoord = ([x, y]: Coordinates): string => x + ':' + y;
const toCoord = (str: string): Coordinates => {
    const [x, y] = str.split(':');
    return [Number.parseInt(x), Number.parseInt(y)];
};

export class ShortPathList {
    shortestPaths: { [coord: string]: { cost: number; path: Coordinates[] } | undefined } = {};

    constructor(unit: Readonly<GameUnit>) {
        const {
            battlefield: { weather },
            map,
        } = unit;

        for (let x = 0; x < map.width; x++) {
            for (let y = 0; y < map.height; y++) {
                this.shortestPaths[fromCoord([x, y])] = undefined;
            }
        }

        type SearchNode = {
            target: Coordinates;
            cost: number;
            path: Coordinates[];
        };

        const nodes: SearchNode[] = [{ target: unit.pos, cost: 0, path: [unit.pos] }];
        while (nodes.length > 0) {
            const { target, cost, path } = nodes.shift()!;
            const shortestPath = this.shortestPaths[fromCoord(target)];
            if (!shortestPath || cost < shortestPath.cost) {
                this.shortestPaths[fromCoord(target)] = { cost, path };
                map.neighbours(target).forEach((nextPos) => {
                    if (!(fromCoord(nextPos) in this.shortestPaths)) return;
                    if (!map.isValid(nextPos)) return;
                    const tile = map.at(nextPos);
                    if (tile.unit && !tile.unit.isAllied(unit.army)) return;
                    const tileCost = getMovementCost(tile.type, unit.data.movementType, weather);
                    if (cost + tileCost > unit.data.moveRange) return;
                    nodes.push({
                        target: nextPos,
                        cost: cost + tileCost,
                        path: [...path, nextPos],
                    });
                });
            }
        }

        for (const [key, path] of Object.entries(this.shortestPaths)) {
            if (!path) continue;

            const pos = toCoord(key);
            if (map.at(pos).unit) {
                this.shortestPaths[key] = undefined;
                continue;
            }

            const [noEmbush] = checkPathValidity(unit, path.path);
            if (!noEmbush) {
                this.shortestPaths[key] = undefined;
                continue;
            }
        }
    }

    to([x, y]: Coordinates): readonly Coordinates[] | undefined {
        const result = this.shortestPaths[fromCoord([x, y])];
        return result?.path;
    }

    toArray(): (readonly Coordinates[])[] {
        return Object.values(this.shortestPaths)
            .map((item) => item?.path)
            .filter((path): path is Coordinates[] => !!path);
    }
}
