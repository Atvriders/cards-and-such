import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenSevensState, SevenSevensAction, SevenSevensSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenSevensGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sevenSevensPlugin: GamePlugin<SevenSevensState, SevenSevensAction, typeof settings> = {
  id:"seven-sevens", title:"Seven Sevens", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Card mini: Find the sevens! Each 7 drawn earns 50 points.",
  howToPlay:"Seven Sevens is a 14-draw card mini built around a single goal: find the sevens. Each draw pulls a random card from a fresh 52-card deck, and every 7 you reveal scores 50 points.\n\nThere are four sevens in a deck (one per suit), so the maximum possible score is 200 if every seven cooperates. Realistic scores fall in the 0-150 range, governed mostly by luck. There's no decision to make — just press Draw and pray. The pacing keeps things short and snappy.\n\nAfter each draw the card flips up. Sevens highlight in your running score; everything else is just deck noise. Past draws appear as a sliver beneath your latest card so you can see what's already gone.\n\nDraw 14 cards in total. The game ends and locks in your final score automatically — there's no penalty for non-sevens, just zero contribution. Pure luck, pure cards. Keep drawing!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SevenSevensSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-seven-sevens-primary"]', pulses: 3 }),component:SevenSevensGame,
};
