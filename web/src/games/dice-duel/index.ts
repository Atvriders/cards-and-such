import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceDuelState, DiceDuelAction, DiceDuelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceDuelGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceDuelPlugin: GamePlugin<DiceDuelState, DiceDuelAction, typeof settings> = {
  id:"dice-duel", title:"Dice Duel", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"You vs CPU, 3 dice each. High sum wins. 10 rounds.",
  howToPlay:`Dice Duel pits you against the CPU in a roll-off. Each of 10 rounds, both players roll three six-sided dice. The side with the higher sum wins +10 points. Ties give zero. There's no strategy — both rolls are pure dice luck — but the head-to-head feels surprisingly tense.

Statistically, both you and the CPU have identical odds, so wins/losses/ties should average out to roughly 47.4% / 47.4% / 5.2%. Across 10 rounds you can expect around 4–5 wins for ~40–50 points. A run with 7+ wins is a confident victory; an unlucky run can give you 2–3 wins and a small score.

Press Duel to roll both sets of dice, then Next to advance. The dice display shows your three vs the CPU's three, with the running sum and outcome reported. Roll well and crush the CPU!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceDuelSettings),
  reducer,isTerminal,component:DiceDuelGame,
};
