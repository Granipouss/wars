import { ReplaySubject } from 'rxjs';
import * as Colyseus from 'colyseus.js';
import { Game, GameEvent, GameSide } from '../engine';
import { data as mapData } from '../maps/hip';
import { Application } from './graphics/app';
import { RandomController } from './random.controller';

import './style.scss';

const USE_SERVER = true;

const logElement = document.querySelector('#logs')!;
const addLog = (payload: any, type: string) => {
    const line = document.createElement('span');
    line.className = `is-${type}`;
    line.innerText = `[${type}] ${JSON.stringify(payload)}`;
    logElement.append(line, '\n');
};

if (USE_SERVER) {
    const client = new Colyseus.Client('ws://localhost:2567');
    client.joinOrCreate('game').then((room) => {
        const events = new ReplaySubject<GameEvent>(1);
        room.onMessage('game:event', (event) => {
            addLog(event, 'state');
            events.next(event);
        });

        room.onMessage('set:slot', (slot) => {
            const controller = new RandomController(slot, {
                events: events.asObservable(),

                act: (action) => {
                    room.send('game:action', action);
                },
            });
            controller.start();

            const app = new Application(slot, controller.game);
            document.querySelector('#app')!.appendChild(app.view);

            app.run();
        });
    });
} else {
    const game = new Game({
        map: mapData,
        armies: [
            { color: 'red', co: 'Andy' },
            { color: 'green', co: 'Eagle' },
        ],
    });

    game.events.subscribe((event) => {
        // console.log(event);
        addLog(event, 'state');
    });

    for (let slot = 0; slot < 2; slot++) {
        const side = new GameSide(slot, game);

        const controller = new RandomController(slot, {
            events: side.events,
            act(action) {
                try {
                    addLog(action, `p${slot + 1}`);
                    side.act(action);
                } catch (e) {
                    console.error(`p${slot + 1}`, e);
                    debugger;
                }
            },
        });
        controller.start();

        const app = new Application(slot, side);
        document.querySelector('#app')!.appendChild(app.view);
        app.run();
    }

    game.start();
}
