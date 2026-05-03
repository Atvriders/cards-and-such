import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FluxxFantasyRulesState, FluxxFantasyRulesAction, FluxxFantasyRulesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FluxxFantasyRulesGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FluxxFantasyRulesGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fluxxFantasyRulesPlugin: GamePlugin<FluxxFantasyRulesState, FluxxFantasyRulesAction, typeof settings> = {
  id:"fluxx-fantasy-rules",
  title:"Fluxx Fantasy Rules",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Ever-changing fantasy rules card game.",
  howToPlay:"Fluxx Fantasy Rules is a 10-round card game where the rules themselves change every round. Each round draws three fantasy cards (Knight=3, Mage=4, Dragon=5, Princess=2, Wizard=6) and one Rule card (Sum, Max, or Pair). 🔮\n\nYour score for the round depends on the active rule: Sum scores all three values; Max scores triple the highest; Pair scores 10 plus the maximum if any two cards match, else 5. Average rounds land near 12 points. Lucky Pair rules with matches can spike to 16+.\n\nPress Draw to reveal cards and the active rule. Then Next to continue. The rule card glows orange — read it before you tally. Across 10 rounds expect 100 to 140 total. Score 130+ for a Fluxx legendary run. Each round is a tiny puzzle of luck — quick, silly, and full of fantasy chaos. The whole game finishes in well under a minute.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FluxxFantasyRulesSettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-fluxx-fantasy-rules-primary"]', pulses: 3 }),
  component:FluxxFantasyRulesGame,
};
