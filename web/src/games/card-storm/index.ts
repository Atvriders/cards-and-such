import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardStormState, CardStormAction, CardStormSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardStormGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardStormPlugin: GamePlugin<CardStormState, CardStormAction, typeof settings> = {
  id:"card-storm", title:"Card Storm", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Random storms reshuffle your hand mid-round. Lock in points across 8 rounds.",
  howToPlay:`Card Storm is a quick luck-vs-luck card game spread across 8 rounds. At the start of each round, four random cards are dealt face up — but a "storm" has a 40% chance of striking and reshuffling the hand into a different four cards.

Whatever ends up on the table is what you've got. Press Lock Hand to score the rank values: 2-10 are face value, Jack 11, Queen 12, King 13, Ace 14. The total of all four ranks is added to your score, then you advance to the next round.

There are no choices — just face the storm and accept the deal. Average hands score around 32 points (mean rank 8 × 4 cards), so a strong full game lands in the 240-300 range. Lucky rounds with multiple Aces and Kings can push individual round scores past 50.

8 rounds, no skill, all chaos. Brace for the storm and hope for high cards!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardStormSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-storm-primary"]', pulses: 3 }), component:CardStormGame,
};
