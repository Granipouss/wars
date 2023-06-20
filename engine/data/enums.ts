export const MovementTypes = [
    //
    'foot',
    'boots',
    'treads',
    'tires',
    'air',
    'sea',
    'lander',
    'pipe',
] as const;
export type MovementType = (typeof MovementTypes)[number];

export const WeatherTypes = [
    //
    'clear',
    'rain',
    'snow',
] as const;
export type WeatherType = (typeof WeatherTypes)[number];
