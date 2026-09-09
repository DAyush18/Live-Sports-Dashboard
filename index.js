import express from "express";
import { matchesRouter } from "./routes/matches.js";

const app = express();

app.use(express.json());

app.get('/',(req,res)=>{

res.send("Server is running!");
})

app.use('/api/matches', matchesRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})