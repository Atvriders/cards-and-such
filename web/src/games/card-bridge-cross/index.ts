import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardBridgeCrossState, CardBridgeCrossAction, CardBridgeCrossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardBridgeCrossGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardBridgeCrossPlugin: GamePlugin<CardBridgeCrossState, CardBridgeCrossAction, typeof settings> = {
  id:"card-bridge-cross", title:"Card Bridge Cross", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cross 8 wobbly bridge planks. Even-rank cards hold; odd cards wobble for less.",
  howToPlay:"Card Bridge Cross is an 8-round card mini themed around crossing a rickety wooden bridge. Each round draws a single card representing the next plank. Even-rank planks (2, 4, 6, 8, 10, Q) are stout and hold firmly — score 15 points. Odd-rank planks (3, 5, 7, 9, J, K, A) wobble underfoot — score 5 points.\\n\\nThere's no choice; each plank is drawn at random from a 52-card deck and your goal is to make it across all 8 in one piece. Press Draw to step on the next plank, then Next to advance.\\n\\nAverage scores land around 70-90 points. Lucky bridges (lots of evens) push 110+. The game's about as deep as a creek, but it's a charming way to test a streak of luck and watch the planks reveal themselves one by one. Don't look down!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardBridgeCrossSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-bridge-cross-primary"]', pulses: 3 }), component:CardBridgeCrossGame,
};
