import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePaintingState, DicePaintingAction, DicePaintingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePaintingGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dicePaintingPlugin: GamePlugin<DicePaintingState, DicePaintingAction, typeof settings> = {
  id:"dice-painting", title:"Dice Painting", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll dice to mix paint colors — even rolls make the prettiest hues!",
  howToPlay:`Dice Painting is a 10-round dice game with an artist theme. Each round, you roll one six-sided die. Rolls of 2, 4, or 6 (the warm, balanced color spectrum) score 10 points each. Odd rolls (1, 3, 5) — the unbalanced shades — score zero.

Press Roll Die to paint each round. With even rolls comprising 50% of outcomes (3 of 6 faces), your expected score is around 50 points. A flawless 10/10 even-roll session scores 100; a stretch of odd luck could leave you under 30.

There are no decisions or choices — just roll and watch the score climb. After 10 rounds, the painting is complete and your final canvas is revealed. Channel your inner Bob Ross — there are no mistakes, only happy accidents!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DicePaintingSettings),
  reducer,isTerminal,component:DicePaintingGame,
};
