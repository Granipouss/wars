import { Client, Room, ErrorCode } from '@colyseus/core';
import { Game, GameSide } from '../../engine';

import { data as mapData } from '../../maps/hip';

export class GameRoom extends Room {
    game!: Game;

    onJoin(client: Client, options?: any) {
        if (this.clients.length === 2) {
            this.startGame();
        }
    }

    onDispose() {
        this.game.complete();
    }

    startGame() {
        this.lock();

        this.game = new Game({
            map: mapData,
            armies: [
                { color: 'red', co: 'Andy' },
                { color: 'green', co: 'Eagle' },
            ],
        });

        const sides: GameSide[] = [];
        for (let slot = 0; slot < 2; slot++) {
            const client = this.clients[slot];

            client.send('set:slot', slot);

            const side = new GameSide(slot, this.game);
            side.events.subscribe((ev) => {
                console.log(this.roomId, 'event', `p${slot + 1}`, ev);
                client.send('game:event', ev);
            });
            sides.push(side);
        }

        this.game.start();

        this.onMessage('game:action', (client, message) => {
            const slot = this.clients.indexOf(client);
            console.log(this.roomId, 'action', `p${slot + 1}`, message);
            try {
                sides[slot].act(message);
            } catch (error) {
                client.error(ErrorCode.APPLICATION_ERROR, String(error));
                console.error(error);
            }
        });
    }
}
