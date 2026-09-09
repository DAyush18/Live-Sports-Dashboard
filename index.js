import express from "express";
import http from "http";
import { attachWebSocketServer } from "./ws/server.js";
import { matchesRouter } from "./routes/matches.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(app);

app.get('/',(req,res)=>{

res.send("Server is running!");
})

app.use('/api/matches', matchesRouter);

const {broadcastMatchCreated} = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;




server.listen(PORT, HOST,  ()=>{
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
    console.log(`Server is running on port ${baseUrl}`);
    console.log(`WebSocket is running on ${baseUrl.replace('http', 'ws')}/ws`);
})