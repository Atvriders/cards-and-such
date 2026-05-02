import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCliffJumpState, CardCliffJumpAction, CardCliffJumpSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardCliffJumpGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCliffJumpPlugin: GamePlugin<CardCliffJumpState, CardCliffJumpAction, typeof settings> = {
  id:"card-cliff-jump", title:"Card Cliff Jump", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Jump cards over a cliff: high cards (J/Q/K/A) skip safely. 12 rounds.",
  howToPlay:"Card Cliff Jump is a tiny card-flip mini. You get 12 rounds. Each round, draw a card and watch it 'jump' over the cliff. High cards (Jack, Queen, King, Ace) clear the gap and earn 10 points. Numbered cards (2-10) crash to the bottom for nothing.\n\nThe probabilities are simple: 16/52 cards (about 30.8%) are face cards or aces and will safely leap. The other 36 cards drop into the canyon. Across 12 rounds, expect to land an average of around 36 points, but a hot streak can push you up near 80 points.\n\nThere's no skill — just press Draw, watch the card flip, and see whether it cleared the cliff. After each result, press Next to continue. The score totals at the end. Average runs land near 30-40 points; lucky players who pull lots of court cards can score 80 or more!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCliffJumpSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-cliff-jump-primary"]', pulses: 3 }), component:CardCliffJumpGame,
};
