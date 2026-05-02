import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RankRumbleState, RankRumbleAction, RankRumbleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RankRumbleGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const rankRumblePlugin: GamePlugin<RankRumbleState, RankRumbleAction, typeof settings> = {
  id:"rank-rumble", title:"Rank Rumble", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Deal 4 cards. Bonuses scale with matching ranks — pairs, trips, and quads.",
  howToPlay:`Rank Rumble is a 10-round card game that rewards rank-matching. Each round, four random cards are dealt face-up. The score for the round depends on how many cards share a rank:

- Four of a kind (e.g., four Queens): a colossal +200 points.
- Three of a kind: +50 points.
- Two pair (e.g., two Jacks and two Sevens): +30 points.
- One pair: +15 points.
- All four different ranks: +10 consolation.

Pairs are common (about 50% of hands have at least one pair). Trips appear roughly 1 in 35 hands. Four-of-a-kind is rare — roughly 1 in 5,000 — and triggers the 200-point jackpot whoop.

There are no decisions; each round is pure draw and tally. Average game scores cluster around 150-200 points. A well-timed three-of-a-kind round will spike your run, and the cosmic four-of-a-kind round is something you'll remember.

Round after round, watch the deck deliver its luck!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RankRumbleSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-rank-rumble-primary"]', pulses: 3 }),component:RankRumbleGame,
};
