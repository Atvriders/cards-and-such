import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceAirhockeyState, DiceAirhockeyAction, DiceAirhockeySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceAirhockeyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceAirhockeyPlugin: GamePlugin<DiceAirhockeyState, DiceAirhockeyAction, typeof settings> = {
  id:"dice-airhockey", title:"Dice Air Hockey", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Puck-slam digital table; first to 7.",
  howToPlay:"Dice Air Hockey simulates the arcade table sport where players slap a frictionless puck across a low-friction air-cushioned table, trying to score in the opposing slot. First to 7 goals wins; the mini awards bonus points for a fast win.\n\nEach round you Roll two dice. Goal mapping: dice sum 11-12 = your goal (+1 score), sum 2-3 = opponent goal (-1), sum 7 = save (0), other sums = neutral. Game ends when you reach 7 goals or after 20 rounds.\n\nYour final score equals 50 + (10 × your goals) - (5 × opponent goals) + (5 × rounds remaining if you finish early). Average runs land between 70 and 110; a fast 7-0 win can clear 150. A 7-0 cleansheet is the maximum.\n\nReal air hockey has a vibrant tournament circuit (USAA championships) where the speed and reflex demands rival ping-pong. This mini compresses paddle exchanges into compact dice. Press Roll, Next. Crisp, retro-flavoured, and addictive.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceAirhockeySettings),
  reducer,isTerminal,component:DiceAirhockeyGame,
};
