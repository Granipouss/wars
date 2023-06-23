import http from 'http';
import cors from 'cors';
import express from 'express';
import { logger, Server, ServerOptions } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { monitor } from '@colyseus/monitor';
import { playground } from '@colyseus/playground';

/**
 * Import your Room files
 */
import { LobbyRoom } from '@colyseus/core';
import { GameRoom } from './rooms/game.room';

function setupExpress(app: express.Express) {
    // Enable CORS + JSON parsing.
    app.use(cors());
    app.use(express.json());

    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    // app.get('/hello_world', (req, res) => {
    //     res.send("It's time to kick ass and chew bubblegum!");
    // });

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== 'production') {
        app.use('/', playground);
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use('/colyseus', monitor());

    logger.info('✅ Express initialized');
}

function setupGameServer(gameServer: Server) {
    gameServer.define('lobby', LobbyRoom);
    gameServer.define('game', GameRoom).enableRealtimeListing();
}

export async function listen(serverOptions: ServerOptions = {}, port = Number(process.env.PORT || 2567)) {
    const app = express();
    setupExpress(app);

    const server = http.createServer(app);
    const transport = new WebSocketTransport({ server });

    const gameServer = new Server({ ...serverOptions, transport });
    setupGameServer(gameServer);

    await gameServer.listen(port);

    logger.info(`⚔️  Listening on http://localhost:${port}`);

    return gameServer;
}

if (require.main === module) {
    listen();
}
