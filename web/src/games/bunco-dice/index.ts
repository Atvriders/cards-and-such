import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BuncoDiceState, BuncoDiceAction, BuncoDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BuncoDiceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BuncoDiceGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const buncoDicePlugin: GamePlugin<BuncoDiceState, BuncoDiceAction, typeof settings> = {
  id:"bunco-dice", title:"Bunco Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Team-rotation dice game. Roll 3 dice; matching the round number scores. 6 rounds.",
  howToPlay:"Bunco is a team-rotation dice party game where you score by matching the current round number. In this compact version, you play 6 rounds (the standard Bunco round count) rolling three dice each.\n\nEach round, the target number changes: round 1 = 1s, round 2 = 2s, etc. up to round 6 = 6s. Each die showing the target = 5 points. Three-of-a-kind matching the target = 21 points (a \"Bunco!\"). Three-of-a-kind not matching the target = 5 points (a \"Mini Bunco\").\n\n6 rounds total. The probability of rolling the target on any given die is 1/6, so each round you expect about 0.5 hits = 2.5 points. A Bunco (rolling all three of the round's target number) has odds of 1/216 per roll — rare but session-defining.\n\nAverage expected score: 30-70 points. A Bunco at any point in the session is the dream.\n\nFast, social, classic dice party fun in single-player form.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BuncoDiceSettings),
  reducer,isTerminal,
  hint: (state: BuncoDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "roll") return { selector: '[data-testid="hint-target-bunco-dice-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-bunco-dice-next"]', pulses: 3 };
    return null;
  },
  component:BuncoDiceGame,
};
