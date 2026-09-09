// import arcjet , {detectBot, shield, slidingWindow} from '@arcjet/node';
import 'dotenv/config';

// const arcjetkey = process.env.ARCJET_KEY;
// const arcjetmode = process.env.ARCJET_MODE === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

// if(!arcjetkey) throw new Error("Arcjet key is not set in environment variables. Please set ARCJET_KEY in your .env file.");

// export const httpArcjet = arcjetkey ?
//     arcjet({
//         key : arcjetkey,
//         rules : [
//             shield({mode : arcjetmode}),
//             detectBot({mode : arcjetmode, allow: ['CATEGORY : SEARCH_ENGINE', 'CATEGORY: PREVIEW']}),
//             slidingWindow({mode : arcjetmode, interval : '10s', max : 50}),

//         ],
//     })
//     : null;

    
// export const wsArcjet = arcjetkey ?
//     arcjet({


//            key : arcjetkey,
//         rules : [
//             shield({mode : arcjetmode}),
//             detectBot({mode : arcjetmode, allow: ['CATEGORY : SEARCH_ENGINE', 'CATEGORY: PREVIEW']}),
//             slidingWindow({mode : arcjetmode, interval : '2s', max : 5}),

//         ],

//     })
//     : null;

//     export function securityMiddleware(){
//         return async(req, res, next) =>{
//             if(!httpArcjet) return next();

//             try{
//                 const decision = await httpArcjet.protect(req);
//                 if(decision.isDenied()){
//                   if(decision.reason.isRateLimit()){
//                     return res.status(429).json({error : 'Too many requests. Please try again later.'});
//                   }
//                   return res.status(403).json({error : 'Access denied. Please contact support if you believe this is an error.'});
//                 }

//                 next();
//             }catch(e){
//                 console.error('Arcjet middleware error:', e);
//                 return res.status(503).json({error : 'Service unavailable'});
//             }

//         }
//     }

import arcjet, {detectBot, shield, slidingWindow} from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJECT_MODE === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

if(!arcjetKey) throw new Error('ARCJET_KEY environment variable is missing.');

export const httpArcjet = arcjetKey ?
    arcjet({
        key: arcjetKey,
        rules: [
            shield({ mode: arcjetMode }),
            detectBot({ mode: arcjetMode, allow: ['CATEGORY:SEARCH_ENGINE', "CATEGORY:PREVIEW" ]}),
            slidingWindow({ mode: arcjetMode, interval: '10s', max: 50 })
        ],
    }) : null;

export const wsArcjet = arcjetKey ?
    arcjet({
        key: arcjetKey,
        rules: [
            shield({ mode: arcjetMode }),
            detectBot({ mode: arcjetMode, allow: ['CATEGORY:SEARCH_ENGINE', "CATEGORY:PREVIEW" ]}),
            slidingWindow({ mode: arcjetMode, interval: '2s', max: 5 })
        ],
    }) : null;

export function securityMiddleware() {
    return async (req, res, next) => {
        if(!httpArcjet) return next();

        try {
            const decision = await httpArcjet.protect(req);

            if(decision.isDenied()) {
                if(decision.reason.isRateLimit()) {
                    return res.status(429).json({ error: 'Too many requests.' });
                }

                return res.status(403).json({ error: 'Forbidden.' });
            }
        } catch (e) {
            console.error('Arcjet middleware error', e);
            return res.status(503).json({ error: 'Service Unavailable' });
        }

        next();
    }
}