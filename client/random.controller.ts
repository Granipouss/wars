import { Subscription } from 'rxjs';
import { GameBattlefield, IGame, MovementManager, Utils } from '../engine';

export class RandomController {
    subscription?: Subscription;
    done = false;

    armyId = '';
    battlefield!: GameBattlefield;

    constructor(
        //
        readonly slot: number,
        readonly game: IGame,
    ) {}

    async start() {
        this.subscription = this.game.events.subscribe(async (event) => {
            switch (event.type) {
                case 'state': {
                    this.battlefield = new GameBattlefield(event.state);
                    this.armyId = this.battlefield.armies[this.slot].id;
                    return;
                }
                case 'tie':
                case 'win': {
                    this.close();
                    return;
                }
                case 'turn': {
                    this.battlefield.patch(event);
                    if (this.battlefield.activeArmy.id === this.armyId) {
                        await this.playTurn();
                    }
                    return;
                }
                default: {
                    this.battlefield?.patch(event);
                    return;
                }
            }
        });
    }

    async playTurn() {
        await Promise.resolve();

        if (Math.random() < 0.01) {
            this.game.act({ type: 'forfeit', armyId: this.armyId });
            return;
        }

        const map = this.battlefield.map;
        const army = this.battlefield.getArmy(this.armyId);

        for (const unit of army.units) {
            await Promise.resolve();
            if (Math.random() < 0.1) {
                this.game.act({ type: 'wait', unitId: unit.id });
            } else {
                const shortestPaths = new MovementManager.ShortPathList(unit);
                const path = Utils.randomFrom(shortestPaths.toArray());

                const targetPos = Utils.lastFrom(path);
                const target = map
                    .neighbours(targetPos)
                    .map(map.at.bind(map))
                    .map((tile) => tile.unit)
                    .find((other) => other && unit.canAttack(other.type) && !other.isAllied(army));

                this.game.act({
                    type: 'move',
                    unitId: unit.id,
                    path,
                    then: target ? { type: 'attack', targetId: target.id } : { type: 'wait' },
                });

                if (this.done) return;
            }
        }

        this.game.act({ type: 'end-turn' });
    }

    close() {
        this.subscription?.unsubscribe();
        this.done = true;
    }
}
