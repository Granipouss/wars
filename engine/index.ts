import { COsData, CountryTypes } from './data/commanding-officer';
import { MovementTypes, WeatherTypes } from './data/enums';
import { PropertiesData } from './data/property';
import { TerrainsData } from './data/terrain';
import { UnitsData } from './data/unit';

export const WarsData = {
    properties: PropertiesData,
    terrain: TerrainsData,
    units: UnitsData,
    cos: COsData,
    countries: CountryTypes,
    movements: MovementTypes,
    weathers: WeatherTypes,
};

export type { DamageTable } from './data/damage';
export type { MovementType, WeatherType } from './data/enums';
export type { MapData } from './data/map';
export type { PropertyData, PropertyType } from './data/property';
export type { TerrainData, TerrainType } from './data/terrain';
export type { UnitData, UnitType } from './data/unit';
export type { COData, COType, CountryType, PowerData } from './data/commanding-officer';

export * as BattleManager from './managers/battle';
export * as MovementManager from './managers/movement';

export * from './objects/army';
export * from './objects/commanding-officer';
export * from './objects/coordinates';
export * from './objects/map';
export * from './objects/property';
export * from './objects/types';
export * from './objects/unit';
export * from './objects/warfog';

export * from './game.action';
export * from './game.event';
export * from './game.battlefield';
export * from './game.exception';
export * from './game';
export * from './game.side';

export * as Utils from './utils';
