import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TripleDealState, TripleDealAction, TripleDealSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TripleDealGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TripleDealGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tripleDealPlugin: GamePlugin<TripleDealState, TripleDealAction, typeof settings> = {
  id:"triple-deal", title:"Triple Deal", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Three cards are dealt; predict whether the middle card's rank lies between the outer two.",
  howToPlay:`Triple Deal is a classic 'in-between' card mini, also known as Acey-Deucey or Yablon. Each round, you predict whether the Middle card's rank will fall strictly between the ranks of the Left and Right cards. Predict 'Yes' if you think the middle is between; 'No' if you think it lies outside.

After your bet, three cards are revealed. Aces are high. If your prediction matches, you score 10 points. If any two of the three cards tie in rank, the round is a Push and earns 0 points.

There are 12 rounds. With three randomly drawn cards, the probability that the middle one lies strictly between the other two is roughly 31%, so the smarter base bet is generally 'No'. But streaks happen — and a clever player who watches each round can adjust gut calls.

Average expected scores hover around 65; consistent betters of 'No' will typically out-perform random play.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TripleDealSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-triple-deal-primary"]', pulses: 3 }),component:TripleDealGame,
};
