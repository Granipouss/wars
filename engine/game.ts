import { Observable, Subject } from 'rxjs';

import { COType } from './data/commanding-officer';
import { MapData } from './data/map';
import { UnitType, UnitsData } from './data/unit';

import { computeDamage, getBaseDamages } from './managers/battle';
import { checkPathValidity } from './managers/movement';

import { ArmyColor, GameArmy } from './objects/army';
import { GameUnit } from './objects/unit';
import { Coordinates, dist } from './objects/coordinates';

import { GameAction } from './game.action';
import { GameBattlefield } from './game.battlefield';
import { GameEvent } from './game.event';
import { GameException, InvalidActionException } from './game.exception';

export type GameOptions = {
    map: MapData;
    armies: {
        color: ArmyColor;
        co: COType;
    }[];
    warfog?: boolean;
};

export interface IGame {
    readonly events: Observable<GameEvent>;

    act(action: GameAction): void;
}

/**
 * Game
 * ---
 * Core class of a game.
 */
export class Game implements IGame {
    #completed = false;

    readonly #events = new Subject<GameEvent>();
    readonly events = this.#events.asObservable();

    battlefield: GameBattlefield;

    constructor(readonly options: GameOptions) {
        this.battlefield = new GameBattlefield({
            map: options.map,
            armies: options.armies.map((army) => ({
                color: army.color,
                co: { type: army.co },
                warfog: options.warfog,
            })),
        });
    }

    start(): void {
        this.emit({ type: 'state', state: this.battlefield.state });
        this.startTurn();
    }

    protected emit(event: GameEvent): void {
        if (event.type !== 'state') {
            this.battlefield?.patch(event);
        }

        this.#events.next(event);
    }

    checkForWin(): void {
        if (this.#completed) return;

        for (const army of this.battlefield.armies) {
            if (army.isPlaying() && army.checkForLoss()) {
                this.emit({ type: 'loss', armyId: army.id });
            }
            if (army.status === 'winner') {
                this.declareWinner(army);
                return;
            }
        }

        const remainingArmies = this.battlefield.armies.filter((a) => a.isPlaying());
        if (remainingArmies.length === 1) {
            this.declareWinner(remainingArmies[0]);
            return;
        }
        if (remainingArmies.length === 0) {
            this.declareWinner();
            return;
        }
    }

    declareWinner(army?: GameArmy): void {
        if (army) {
            this.emit({ type: 'win', armyId: army.id });
        } else {
            this.emit({ type: 'tie' });
        }

        this.complete();
    }

    complete(): void {
        this.#events.complete();
        this.#completed = true;
    }

    isCompleted(): boolean {
        return this.#completed;
    }

    /**
     * Apply a GameAction and trigger GameEvents
     *
     * @param action
     */
    act(action: GameAction): void {
        try {
            switch (action.type) {
                case 'move': {
                    const unit = this.getActiveUnit(action.unitId);
                    if (unit.isIndirect() && action.path.length > 1 && action.then.type === 'attack') {
                        throw new InvalidActionException(`Indirect units cannot attack after they moved.`);
                    }
                    const canActMore = this.move(unit, action.path);
                    if (canActMore) {
                        this.act({ unitId: unit.id, ...action.then });
                    } else {
                        this.emit({ type: 'embush', unitId: unit.id });
                    }
                    break;
                }
                case 'wait': {
                    this.wait(action.unitId);
                    break;
                }
                case 'ability': {
                    switch (action.kind) {
                        case 'repair': {
                            this.repair(action.unitId, action.unitId);
                            break;
                        }
                        case 'capture': {
                            this.capture(action.unitId);
                            break;
                        }
                        case 'supply': {
                            this.supply(action.unitId);
                            break;
                        }
                        case 'explode': {
                            this.explode(action.unitId);
                            break;
                        }
                        case 'hide': {
                            this.stealth(action.unitId);
                            break;
                        }
                        case 'show': {
                            this.unstealth(action.unitId);
                            break;
                        }
                    }
                    break;
                }
                case 'launch': {
                    this.launch(action.unitId, action.targetPosition);
                    break;
                }
                case 'load': {
                    this.load(action.unitId, action.targetId);
                    break;
                }
                case 'unload': {
                    for (const unload of action.unloads) {
                        this.unload(action.unitId, unload.unitId, unload.position);
                    }
                    break;
                }
                case 'attack': {
                    this.attack(action.unitId, action.targetId);
                    break;
                }
                case 'repair': {
                    this.repair(action.unitId, action.targetId);
                    break;
                }
                case 'build': {
                    this.build(action.propertyId, action.unitType);
                    break;
                }
                case 'co-power': {
                    this.useCOPower();
                    break;
                }
                case 'co-super-power': {
                    this.useSuperCOPower();
                    break;
                }
                case 'end-turn': {
                    this.endTurn();
                    break;
                }
                case 'forfeit': {
                    const army = this.battlefield.getArmy(action.armyId);
                    this.forfeit(army);
                    break;
                }
            }
        } catch (error) {
            if (error instanceof GameException && !(error instanceof InvalidActionException)) {
                throw new InvalidActionException(error.message);
            }
            throw error;
        }
    }

    getActiveUnit(unitId: string) {
        const unit = this.battlefield.getUnit(unitId);
        if (unit.army !== this.battlefield.activeArmy) throw new Error(`Unit ${unitId} cannot act this turn.`);
        if (!unit.active) throw new Error(`Unit ${unitId} cannot act (again) this turn.`);
        return unit;
    }

    getActiveProperty(propertyId: string) {
        const property = this.battlefield.getProperty(propertyId);
        if (property.army !== this.battlefield.activeArmy)
            throw new Error(`Property ${property.id} cannot be used this turn.`);
        return property;
    }

    startTurn() {
        let nextTurn = this.battlefield.turn;
        do {
            nextTurn++;
        } while (!this.battlefield.armies[nextTurn % this.battlefield.armies.length].isPlaying());

        this.emit({ type: 'turn', turn: nextTurn });
    }

    move(unit: GameUnit, path: readonly Coordinates[]): boolean {
        const [noEmbush, actualPath] = checkPathValidity(unit, path);
        this.emit({ type: 'move', unitId: unit.id, path: actualPath });
        return noEmbush;
    }

    wait(unitId: string) {
        const unit = this.getActiveUnit(unitId);
        this.emit({ type: 'wait', unitId: unit.id });
    }

    capture(unitId: string) {
        const unit = this.battlefield.getUnit(unitId);
        if (!unit.canCapture()) throw new GameException(`Unit ${unit.id} cannot capture a property.`);
        const property = this.battlefield.map.at(unit.pos).property;
        if (!property) throw new GameException(`No property under ${unit.id} at (${unit.x}, ${unit.y}).`);
        if (property.isAllied(unit.army)) throw new GameException(`Cannot capture allied property ${property.id}`);

        throw new Error('Method not implemented.');
    }

    supply(unitId: string) {
        const unit = this.battlefield.getUnit(unitId);

        throw new Error('Method not implemented.');
    }

    explode(unitId: string) {
        const unit = this.battlefield.getUnit(unitId);

        throw new Error('Method not implemented.');
    }

    stealth(unitId: string) {
        const unit = this.battlefield.getUnit(unitId);

        throw new Error('Method not implemented.');
    }

    unstealth(unitId: string) {
        const unit = this.battlefield.getUnit(unitId);

        throw new Error('Method not implemented.');
    }

    launch(unitId: string, [x, y]: Coordinates) {
        const unit = this.battlefield.getUnit(unitId);
        if (!this.battlefield.map.isValid([x, y])) {
            throw new GameException(`Coordinates (${x}, ${y}) are out of bounds.`);
        }

        throw new Error('Method not implemented.');
    }

    load(unitId: string, transportId: string) {
        const transport = this.battlefield.getUnit(transportId);
        const unit = this.battlefield.getUnit(unitId);

        throw new Error('Method not implemented.');
    }

    unload(transportId: string, unitId: string, [x, y]: Coordinates) {
        const transport = this.battlefield.getUnit(transportId);
        const unit = this.battlefield.getUnit(unitId);
        const tile = this.battlefield.map.at([x, y]);
        if (tile.unit) {
            throw new GameException(`Target position (${x}, ${y}) is occupied.`);
        }
        if (dist(transport.pos, [x, y]) > 1) {
            throw new GameException(`Cannot unload remotely.`);
        }

        throw new Error('Method not implemented.');
    }

    oneSideAttack(attacker: GameUnit, defender: GameUnit) {
        const [primaryDamage, secondaryDamage] = getBaseDamages(attacker.ammo > 0, attacker.type, defender.type);
        const willUseAmmo = primaryDamage > secondaryDamage;

        const damage = computeDamage(attacker, defender, true);
        if (damage === 0) return;

        this.emit({
            type: 'attack',
            attackerId: attacker.id,
            defenderId: defender.id,
            damage,
            usedAmmo: willUseAmmo ? 1 : 0,
        });

        if (defender.isDead()) {
            this.emit({ type: 'death', unitId: defender.id });
        }
    }

    attack(attackerId: string, defenderId: string) {
        const attacker = this.getActiveUnit(attackerId);
        const defender = this.battlefield.getUnit(defenderId);

        if (defender.isAllied(attacker.army)) {
            throw new InvalidActionException(`No friendly fire.`);
        }

        if (!attacker.data.attackRange || !attacker.canAttack(defender.type)) {
            throw new InvalidActionException(`Unit ${attacker.id} cannot attack ${defender.id}.`);
        }

        const distance = dist(attacker.pos, defender.pos);
        const [minRange, maxRange] = attacker.data.attackRange ?? [0, 0];
        if (distance < minRange || distance > maxRange) {
            throw new InvalidActionException(
                `Target ${defender.id}  at distance ${distance} is out of range (${minRange}, ${maxRange}).`,
            );
        }

        this.oneSideAttack(attacker, defender);
        if (!attacker.isIndirect() && !defender.isDead()) {
            this.oneSideAttack(defender, attacker);
        }
    }

    repair(unitId: string, targetId: string) {
        const unit = this.battlefield.getUnit(unitId);
        const target = this.battlefield.getUnit(targetId);

        throw new Error('Method not implemented.');
    }

    useSuperCOPower() {
        throw new Error('Method not implemented.');
    }

    useCOPower() {
        throw new Error('Method not implemented.');
    }

    build(propertyId: string, type: UnitType) {
        const property = this.getActiveProperty(propertyId);
        if (property.tile.unit) {
            throw new InvalidActionException(`Tile (${property.x}, ${property.y}) is already occupied.`);
        }
        if (UnitsData[type].facility !== property.type) {
            throw new InvalidActionException(`Facility ${property.id} cannot build ${type}.`);
        }

        const unit = new GameUnit(this.battlefield, {
            type,
            x: property.x,
            y: property.y,
            armyId: property.army!.id,
            active: false,
        });

        this.emit({ type: 'build', unit: unit.state });
    }

    endTurn() {
        this.startTurn();
    }

    forfeit(army: GameArmy) {
        for (const unit of army.units) {
            this.emit({ type: 'death', unitId: unit.id });
        }
        this.emit({ type: 'forfeit', armyId: army.id });
    }
}
