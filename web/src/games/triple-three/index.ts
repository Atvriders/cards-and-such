import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TripleThreeState, TripleThreeAction, TripleThreeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TripleThreeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TripleThreeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tripleThreePlugin: GamePlugin<TripleThreeState, TripleThreeAction, typeof settings> = {
  id:"triple-three", title:"Triple Three", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 3 dice for 12 rounds. Score big bonus for rolling triple threes.",
  howToPlay:`Triple Three is a luck-based dice mini centered on the magical roll: three threes. Each round, you roll three six-sided dice. Most rolls earn you 5 points just for participating. If your three dice sum to 12 or more, you score 15 points (high roll bonus). And if you roll the legendary triple threes (3-3-3), you score a massive 50 points.

You play 12 rounds. The probability of rolling triple threes is just 1 in 216 (~0.5%), so most games will see zero of them — but when one hits, it's an electric moment.

Average expected scores hover around 75-90 points across 12 rounds, with most points coming from the floor and the occasional high-roll bonus. Hit a triple three and you'll be partying past 100. Roll, watch, hope, repeat — and when the 3s align, celebrate accordingly!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TripleThreeSettings),
  reducer,isTerminal,
  hint: (state: TripleThreeState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-triple-three-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-triple-three-next"]', pulses: 3 };
    return null;
  },
  component:TripleThreeGame,
};
