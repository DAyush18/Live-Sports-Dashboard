import {WebSocketServer} from 'ws';

function sendJson(socket, payload){
    if(socket.readyState !== WebSocket.OPEN){
        return;
    }

    socket.send(JSON.stringify(payload));
}

const boardCast = (wss, payload) => {
    for(const client of wss.clients){
     if(client.readyState !== WebSocket.OPEN){
        return;
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

    wss.on('connection', (socket) =>{
        sendJson(socket, { type: 'welcome', message: 'Welcome to the WebSocket server!' });

        socket.on('error', console.error);
    });

    function broadcastMatchCreated(match){
        boardCast(wss, { type: 'match_created', data: match });
    }

    return {broadcastMatchCreated}
}