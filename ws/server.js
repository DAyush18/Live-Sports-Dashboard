import {WebSocketServer} from 'ws';
import { wsArcjet } from '../arcjet.js';

function sendJson(socket, payload){
    if(socket.readyState !== WebSocket.OPEN){
        return;
    }

    socket.send(JSON.stringify(payload));
}

const boardCast = (wss, payload) => {
    for(const client of wss.clients){
     if(client.readyState !== WebSocket.OPEN){
        continue;
    }

    client.send(JSON.stringify(payload));
}
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({ 
        server,
        path : '/ws',
        maxPayload : 1024 * 1024, 
    });

    wss.on('connection', async (socket , req) => {

        if(wsArcjet){
            try{
                const decision = await  wsArcjet.protect(req);
                
                if(decision.isDenied()){
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit() ? 'Too many requests. Please try again later.' : 'Access denied. Please contact support if you believe this is an error.';
                    socket.close(code, reason);
                    return;
                }
            }catch(e){
                console.error('Ws Connection error:', e);
                socket.close(code=1011, reason='Arcjet connection error');
                return;
            }
        }
        socket.isAlive = true;
        socket.on('pong', () => { socket.isAlive = true; });

        socket.subscriptions = new Set();

        sendJson(socket, { type: 'welcome' });
        socket.on('error', console.error);
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        })}, 30000);

    wss.on('close', () => clearInterval(interval));


    wss.on('connection', (socket) =>{
        sendJson(socket, { type: 'welcome', message: 'Welcome to the WebSocket server!' });

        socket.on('error', console.error);
    });

    function broadcastMatchCreated(match){
        boardCast(wss, { type: 'match_created', data: match });
    }

    return {broadcastMatchCreated}
}