import { PrimaryDamageTable, SecondaryDamageTable } from '../data/damage';
import { UnitType } from '../data/unit';
import { GameUnit } from '../objects/unit';

export const getBaseDamages = (hasAmmo: boolean, attacker: UnitType, defender: UnitType): [number, number] => {
    const primaryDamage = hasAmmo ? PrimaryDamageTable[attacker]?.[defender] ?? 0 : 0;
    const secondaryDamage = SecondaryDamageTable[attacker]?.[defender] ?? 0;
    return [primaryDamage, secondaryDamage];
};

/**
 * See https://awbw.fandom.com/wiki/Damage_Formula#Formula for more details.
 */
export const computeDamage = (attacker: Readonly<GameUnit>, defender: Readonly<GameUnit>, withLuck = false) => {
    const [primaryDamage, secondaryDamage] = getBaseDamages(attacker.ammo > 0, attacker.type, defender.type);
    const baseDamage = Math.max(primaryDamage, secondaryDamage);

    const B = baseDamage; // Base damage against that unit (see the table below)
    const Av = 100; // Attacking unit attack value (eg: 110 for Hawke, +10 for each owned Comm Tower)
    const L = withLuck ? Math.floor(10 * Math.random()) : 0; // Luck damage, defaulting to a random number between 0 and 9
    const Lb = 0; // Bad luck damage, where applicable
    const HPa = attacker.visualHP; // Visual HP of attacker (the displayed number from 1 through 10)
    const Dv = 100; // Defending unit defense value (eg: 80 for Grimm)
    const Dtr = defender.tile.data.defenseStars; // Defending terrain stars (e.g. 1 for Plains, 2 for Woods)
    const HPd = defender.visualHP; // Visual HP of defender (the displayed number from 1 through 10)

    const rate = ((B * Av) / 100 + L - Lb) * (HPa / 10) * ((200 - (Dv + Dtr * HPd)) / 100);
    return Math.round(rate);
};
