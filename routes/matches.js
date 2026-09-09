import { Router } from 'express'
import {desc} from "drizzle-orm";
import { createMatchSchema, listMatchesQuerySchema } from '../validation/matches.js'
import { db } from '../db/db.js'
import { matches } from '../db/schema.js' // <-- import your matches table
import { getMatchStatus } from '../utils/match-status.js' // <-- import your status helper

export const matchesRouter = Router();

const MAX_LIMIT = 100;

matchesRouter.get('/', async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', details: parsed.error.issues() });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

   try{
    const data = await db.select().from(matches).orderBy((desc(matches.createdAt))).limit(limit)

    res.json({ data });

   }catch(e){
    res.status(500).json({ error: 'Failed to fetch matches', details: e.message });
   }

});



matchesRouter.post('/', async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues() })
    }

    const { startTime, endTime, homeScore, awayScore } = parsed.data;

    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime)
        }).returning();

        res.status(201).json({ data: event });
    } catch (e) {
        res.status(500).json({ error: 'Failed to create matches', details: e.message })
    }
});