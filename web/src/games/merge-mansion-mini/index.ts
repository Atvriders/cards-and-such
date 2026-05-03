import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MergeMansionMiniState, MergeMansionMiniAction, MergeMansionMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MergeMansionMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mergeMansionMiniPlugin: GamePlugin<MergeMansionMiniState, MergeMansionMiniAction, typeof settings> = {
  id:"merge-mansion-mini", title:"Merge Mansion Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cozy merge-themed match-3.",
  howToPlay:"Merge Mansion Mini is a 60-second match-3 sprint inspired by classic gem-swap puzzlers. The board is a six-by-six grid filled with colorful tiles drawn from a set of six themed icons unique to this variant. Click any tile to select it, then click an adjacent tile (up, down, left, or right) to attempt a swap. If the swap creates a row or column of three or more identical tiles, the matched group vanishes and you score ten points per cleared tile. New tiles cascade down from above to refill the empty cells, sometimes triggering chain reactions for bonus clears that stack scores quickly. Invalid swaps that produce no match are simply cancelled, leaving your selection cleared so you can try another pair. The clock counts down in the header and is your only enemy. Plan two or three moves ahead, watch for L-shaped opportunities, and chase those big multi-cascade combos. When the timer hits zero, your final score is locked. Sharper play yields higher totals — match fast, match smart, match often. Themed: Cozy merge-themed match-3.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MergeMansionMiniSettings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-merge-mansion-mini-action"]', pulses: 3 }; },
  component:MergeMansionMiniGame,
};
