import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MirrorMatchState, MirrorMatchAction, MirrorMatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MirrorMatchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MirrorMatchGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mirrorMatchPlugin: GamePlugin<MirrorMatchState, MirrorMatchAction, typeof settings> = {
  id:"mirror-match", title:"Mirror Match", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Deal two cards. Same rank = match. 10 rounds; +10 per match.",
  howToPlay:`Mirror Match is a pure-luck pair-spotting card mini. Each round, two cards are dealt face up. If they share the same rank — for example, two 7s, two Jacks, or two Queens — that's a Mirror Match and you score 10 points. Suits don't matter.

If the two cards have different ranks (most rounds), you score nothing for the round. The deck refreshes between rounds, so each deal is statistically independent.

Probability of two cards from a fresh 52-card deck sharing a rank is 3/51 (~5.9%). Across 10 rounds, the most likely outcome is 0 or 1 match — so any non-zero score is already a triumph. Two matches in a single 10-round game is genuinely rare and worth bragging about. Three or more borders on miraculous.

Press Deal to flip the pair; press Next to advance to the next round. Maximum theoretical score: 100 points (ten matches in a row — about a 1 in 10^12 lottery shot).`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MirrorMatchSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-mirror-match-primary"]', pulses: 3 }),component:MirrorMatchGame,
};
