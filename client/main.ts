import { Game, GameSide, IGame } from '../engine';
import { data as mapData } from '../maps/hip';
import { Application } from './graphics/app';
import { RandomController } from './random.controller';

import './style.scss';

const game = new Game({
    map: mapData,
    armies: [
        { color: 'red', co: 'Andy' },
        { color: 'green', co: 'Eagle' },
    ],
});
const events = game.events;

const logElement = document.querySelector('#logs')!;
const addLog = (payload: any, type: string) => {
    const line = document.createElement('span');
    line.className = `is-${type}`;
    line.innerText = `[${type}] ${JSON.stringify(payload)}`;
    logElement.append(line, '\n');
};

events.subscribe((event) => {
    // console.log(event);
    addLog(event, 'state');
});

const makeHandler = (slot: number, game: Game): IGame => {
    const side = new GameSide(slot, game);

    const app = new Application(slot, side);
    document.querySelector('#app')!.appendChild(app.view);

    app.run();

    return {
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
    };
};

const p1 = new RandomController(0, makeHandler(0, game));
const p2 = new RandomController(1, makeHandler(1, game));

p1.start();
p2.start();

game.start();
