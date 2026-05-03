import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PipPulseState, PipPulseAction, PipPulseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PipPulseGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PipPulseGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pipPulsePlugin: GamePlugin<PipPulseState, PipPulseAction, typeof settings> = {
  id:"pip-pulse", title:"Pip Pulse", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Predict if the next card's pip value is greater than 7. 12 rounds.",
  howToPlay:`Pip Pulse is a card-prediction mini focused on pip values. Each round, you predict whether the next single card flipped will have a pip value greater than 7 (8, 9, 10, J=11, Q=12, K=13) or 7 and below (2, 3, 4, 5, 6, 7, plus the Ace which counts as 1).

A correct prediction scores 10 points. Wrong predictions score zero. There are 12 rounds in a game.

Probability tip: in a standard deck, there are 6 ranks above 7 (8, 9, 10, J, Q, K = 24 cards), and 7 ranks at 7 or below including the Ace (7 ranks = 28 cards). So 'pip ≤ 7' is the slightly safer bet at about 54% versus 'pip > 7' at 46%.

If you always pick low, expected score is around 65 points across 12 rounds. Truly lucky runs hit 100+. There's no skill ceiling — just call your direction, watch the cards, and see how the percentages land.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PipPulseSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-pip-pulse-primary"]', pulses: 3 }),component:PipPulseGame,
};
