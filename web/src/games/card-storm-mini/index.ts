import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardStormMiniState, CardStormMiniAction, CardStormMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardStormMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardStormMiniPlugin: GamePlugin<CardStormMiniState, CardStormMiniAction, typeof settings> = {
  id:"card-storm-mini", title:"Card Storm Mini", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Storm reshuffles hand — resilient scoring across 8 rounds.",
  howToPlay:"Card Storm Mini is an 8-round chaos mini where every hand is a storm of mixed ranks. You draw 5 cards from a fresh deck per round, and the storm rewards resilience: any hand scores at least a base 10 points, with bonuses for variety in ranks.\n\nYour round score equals 10 base points plus 8 points per unique rank in the hand. So 5 cards all the same rank only scores 18, while 5 cards each of different ranks scores 50 — a true storm of variety. Most random hands will have 4 unique ranks (40 + 10 = 50 points) or 5 unique (50 + 10 = 60 points).\n\nAfter 8 rounds your storm-weathering tally is locked in. Average runs land near 350-420 points across the run. Press Deal 5 to weather each storm, then Next to brave the next round. The more diverse your hand, the better you ride the squall.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardStormMiniSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-storm-mini-primary"]', pulses: 3 }), component:CardStormMiniGame,
};
