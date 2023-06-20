export type Coordinates = readonly [number, number];

export const dist = (A: Coordinates, B: Coordinates) => Math.abs(A[0] - B[0]) + Math.abs(A[1] - B[1]);
