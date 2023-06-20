import type { Coordinates } from './objects/coordinates';

export const random = (n: number) => Math.floor(n * Math.random());

// Arrays

export const lastFrom = <T>(list: readonly T[]) => list[list.length - 1];

export const randomFrom = <T>(list: readonly T[]) => list[random(list.length)];

export const removeFrom = <T>(item: T, list: T[]) => {
    const index = list.indexOf(item);
    if (index >= 0) list.splice(index, 1);
    return list;
};

export const makeArea = (X: number, Y: number) => {
    const list: Coordinates[] = [];
    for (let x = 0; x < X; x++) {
        for (let y = 0; y < Y; y++) {
            list.push([x, y]);
        }
    }
    return list;
};
