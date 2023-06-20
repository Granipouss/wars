import type { WeatherType } from './data/enums';
import type { MapData } from './data/map';
import type { GameEvent } from './game.event';
import { GameException } from './game.exception';
import { GameArmy, ArmyState } from './objects/army';
import { GameMap } from './objects/map';
import { GameProperty, PropertyState } from './objects/property';
import type { WithState } from './objects/types';
import { GameUnit, UnitState } from './objects/unit';

export type BattlefieldState = {
    readonly map: MapData;
    readonly turn?: number;
    readonly weather?: WeatherType;
    readonly armies?: readonly ArmyState[];
    readonly units?: readonly UnitState[];
    readonly properties?: readonly PropertyState[];
};

/**
 * GameBattlefield
 * ---
 * The parent class containing the state of a game.
 *
 * Its properties and children should be mostly "read-only"
 * and be updated using the `patch` method.
 */
export class GameBattlefield implements WithState<BattlefieldState> {
    readonly map: GameMap;

    readonly armies: GameArmy[];
    readonly units: GameUnit[];
    readonly properties: GameProperty[];

    turn: number;
    weather: WeatherType;

    constructor(state: BattlefieldState) {
        this.map = new GameMap(state.map);

        this.armies = (state.armies ?? []).map((t) => new GameArmy(this, t));

        this.units = state.units
            ? state.units.map((u) => new GameUnit(this, u))
            : state.map.units.map((u) => {
                  return new GameUnit(this, {
                      armyId: this.armies[u.team].id,
                      type: u.type,
                      x: u.x,
                      y: u.y,
                  });
              });

        this.properties = state.properties
            ? state.properties.map((p) => new GameProperty(this, p))
            : state.map.properties.map((p) => {
                  return new GameProperty(this, {
                      armyId: p.team < 0 ? undefined : this.armies[p.team].id,
                      type: p.type,
                      x: p.x,
                      y: p.y,
                  });
              });

        this.turn = state.turn ?? 0;
        this.weather = state.weather ?? 'clear';
    }

    get state(): BattlefieldState {
        return {
            map: this.map.data,
            turn: this.turn,
            weather: this.weather,
            armies: this.armies.map((t) => t.state),
            units: this.units.map((u) => u.state),
            properties: this.properties.map((p) => p.state),
        };
    }

    get day(): number {
        return 1 + Math.floor(this.turn / this.armies.length);
    }

    get activeArmy(): GameArmy {
        return this.armies[this.turn % this.armies.length];
    }

    /**
     * Patch the GameBattlefield with an event
     *
     * **This should be the main way of updating the battlefield.**
     *
     * @param event
     */
    patch(event: GameEvent): void {
        switch (event.type) {
            case 'state': {
                throw new Error(`Cannot patch with state event`);
            }
            case 'forfeit': {
                const army = this.getArmy(event.armyId);
                army.status = 'forfeited';
                return;
            }
            case 'loss': {
                const army = this.getArmy(event.armyId);
                army.status = 'loser';
                return;
            }
            case 'win': {
                this.armies.forEach((army) => {
                    if (army.id === event.armyId) {
                        army.status = 'winner';
                    } else if (army.status !== 'forfeited') {
                        army.status = 'loser';
                    }
                });
                return;
            }
            case 'tie': {
                this.armies.forEach((army) => {
                    if (army.status === 'playing') {
                        army.status = 'tied';
                    }
                });
                return;
            }
            case 'turn': {
                this.turn = event.turn;
                this.units.forEach((unit) => {
                    unit.active = true;
                });
                return;
            }
            case 'embush':
            case 'wait': {
                const unit = this.getUnit(event.unitId);
                unit.active = false;
                return;
            }
            case 'move': {
                const targetPos = event.path[event.path.length - 1];
                const unit = this.getUnit(event.unitId);
                unit.moveTo(targetPos);
                return;
            }
            case 'attack': {
                const attacker = this.getUnit(event.attackerId);
                const defender = this.getUnit(event.defenderId);
                defender.hp -= event.damage;
                attacker.ammo -= event.usedAmmo;
                attacker.active = this.activeArmy !== attacker.army;
                return;
            }
            case 'death': {
                const unit = this.getUnit(event.unitId);
                unit.hp = 0;
                unit.remove();
                return;
            }
            case 'build': {
                const unit = new GameUnit(this, event.unit);
                unit.active = false;
                return;
            }
        }
    }

    /**
     * Helper method to generate an id that is unique in the battlefield.
     *
     * _(We use incremental instead of random to ease of testing.)_
     */
    uid(): string {
        return (++this.#lastId).toString().padStart(3, '0');
    }
    #lastId = 0;

    /**
     * Helper method to find an army in the battlefield.
     *
     * Will throw if not found.
     */
    getArmy(armyId: string): GameArmy {
        const army = this.armies.find((a) => a.id === armyId);
        if (!army) throw new GameException(`No army with id: ${armyId}`);
        return army;
    }

    /**
     * Helper method to find a unit in the battlefield.
     *
     * Will throw if not found.
     */
    getUnit(unitId: string): GameUnit {
        const unit = this.units.find((u) => u.id === unitId);
        if (!unit) throw new GameException(`No unit with id: ${unitId}`);
        return unit;
    }

    /**
     * Helper method to find a property in the battlefield.
     * Will throw if not found.
     */
    getProperty(propertyId: string): GameProperty {
        const property = this.properties.find((p) => p.id === propertyId);
        if (!property) throw new GameException(`No property with id: ${propertyId}`);
        return property;
    }
}
