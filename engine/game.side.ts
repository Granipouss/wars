import { Subject } from 'rxjs';

import { Game, IGame } from './game';
import { GameAction } from './game.action';
import { GameEvent } from './game.event';
import { GameException } from './game.exception';

/**
 * GameSide
 * ---
 * One side of a game.
 * Similar to `Game` but with limited information and checks on actions.
 */
export class GameSide implements IGame {
    readonly #events = new Subject<GameEvent>();
    readonly events = this.#events.asObservable();

    constructor(
        //
        readonly slot: number,
        readonly game: Game,
    ) {
        this.game.events.subscribe({
            next: (ev) => this.handleEvent(ev),
            complete: () => this.#events.complete(),
        });
    }

    protected handleEvent(event: GameEvent): void {
        // TODO: Filter events

        this.#events.next(event);
    }

    act(action: GameAction): void {
        const isActive = this.battlefield.activeArmy === this.army;

        if (action.type === 'forfeit') {
            return this.game.act({ type: 'forfeit', armyId: this.army.id });
        }

        if (!isActive) {
            throw new GameException(`It is not your turn.`);
        }

        this.game.act(action);
    }

    get battlefield() {
        return this.game.battlefield;
    }

    get army() {
        return this.game.battlefield.armies[this.slot];
    }
}
