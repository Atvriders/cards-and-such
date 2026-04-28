import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceDiscGolfState, DiceDiscGolfAction, DiceDiscGolfSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceDiscGolfGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceDiscGolfPlugin: GamePlugin<DiceDiscGolfState, DiceDiscGolfAction, typeof settings> = {
  id:"dice-disc-golf", title:"Dice Disc Golf", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Frisbee golf course; 9 holes.",
  howToPlay:"Dice Disc Golf simulates the rapidly-growing American sport where players throw flying discs at metal basket targets across a wooded course, scoring like ball golf — fewest strokes wins.\n\nEach of 9 holes you Roll three dice (your throws). The hole's stroke count is the number of dice rolled before a 5 or 6 appears (a successful basket-make), capped at 5 strokes. Lower is better — par is set at 3 strokes per hole.\n\nYour final score is computed as 100 minus total strokes-over-par across all holes. Average runs land between 60 and 90; a clean course (every hole a 1 or 2) lifts you past 95.\n\nReal disc golf has exploded over the past decade, with the PDGA tour, hundreds of thousands of recreational players, and free public courses in cities worldwide. The aiming finesse, wind reading and shot-shape variety make it richly skilful. This mini abstracts all that into pure dice probability while keeping the under-par scoring rhythm. Press Roll, Next. Quick, modern, and unmistakably outdoorsy.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceDiscGolfSettings),
  reducer,isTerminal,component:DiceDiscGolfGame,
};
