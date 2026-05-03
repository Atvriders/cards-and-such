import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TeenPattiCasState, TeenPattiCasAction, TeenPattiCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TeenPattiCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TeenPattiCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: TeenPattiCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-teen-patti-cas-secondary"]', pulses: 3 };
  return null;
};
export const teenPattiCasPlugin: GamePlugin<TeenPattiCasState, TeenPattiCasAction, typeof settings> = {
  id: "teen-patti-cas", title: "Teen Patti", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Indian three-card poker — beat the dealer's three-card hand.",
  howToPlay: "Teen Patti, also known as Indian Flush, is a three-card poker variant played widely in India. Each round you and the dealer are each dealt three cards. The standard ranking applies: trail (three of a kind), pure sequence (straight flush), sequence (straight), colour (flush), pair, and high card.\n\nEach round you place a one-credit bet, see your three cards, and choose to play (continue and reveal both hands) or fold (forfeit the bet). The dealer's hand is then revealed. The higher hand wins.\n\nTwelve rounds are played. A standard win pays twelve points; a fold pays zero. Premium hands carry bonuses: pair pays sixteen, colour pays eighteen, sequence pays twenty-two, pure sequence pays thirty-five, trail pays sixty.\n\nExpected score is around fifty-five to seventy points across twelve rounds; a single trail or pure sequence can push past 100. Trails appear roughly two-tenths of one per cent, so plan on never seeing one in a typical run — but they are spectacular when they hit. Fold whenever your hand is total trash and the bet is gone.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TeenPattiCasSettings),
  reducer, isTerminal, hint: hint, component: TeenPattiCasGame,
};
