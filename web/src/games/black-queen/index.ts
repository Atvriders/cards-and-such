import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackQueenState, BlackQueenAction, BlackQueenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackQueenGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const blackQueenPlugin: GamePlugin<BlackQueenState, BlackQueenAction, typeof settings> = {
  id:"black-queen", title:"Black Queen", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score 25 points each time you draw a black Queen. 12 draws.",
  howToPlay:"Black Queen is a quick luck-based card minigame. Each press of Draw reshuffles the deck and flips one card — your aim is to land black Queens (the Queen of Spades and the Queen of Clubs).\n\nEach black Queen drawn is worth 25 points; any other card earns nothing. With only two black Queens in a 52-card deck, the per-draw probability is around 1 in 26. Across 12 draws an average run lands 0-50 points; pulling two or more black Queens in a single session is genuinely lucky.\n\nEach draw is independent of the others — there's no penalty for misses, just keep tapping Draw. Watch for ♠ and ♣ paired with the Q rank as your only winning combinations.\n\nWhen all 12 draws are done, your final score locks in. May the dark queens smile on you today!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BlackQueenSettings),
  reducer,isTerminal,component:BlackQueenGame,
};
