import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceVolleyballState, DiceVolleyballAction, DiceVolleyballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceVolleyballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceVolleyballPlugin: GamePlugin<DiceVolleyballState, DiceVolleyballAction, typeof settings> = {
  id:"dice-volleyball", title:"Dice Volleyball", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Set, spike, ace cards; rally to 25.",
  howToPlay:"Dice Volleyball simulates the indoor team court sport where two sides of six rally a ball over a high net, scoring a point per rally. Real volleyball games are first-to-25 (must win by 2), with thrilling sub-100mph spikes and acrobatic digs.\n\nEach round (rally) you Roll three dice. Point mapping: dice contains a triple = ace/kill (+1), dice sum >= 14 = your point (+1), dice sum <= 7 = opponent point (-1), otherwise rally continues (no score). Game ends at 25 your points or after 35 rounds.\n\nFinal score equals 80 + (5 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Average runs land between 110 and 160; a sweeping 25-low-opponent run can clear 180.\n\nReal volleyball features set, spike, block, dig — none represented here, just dice probability. But the rally rhythm and 25-point structure carry through. Press Roll, Next.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceVolleyballSettings),
  reducer,isTerminal,component:DiceVolleyballGame,
};
