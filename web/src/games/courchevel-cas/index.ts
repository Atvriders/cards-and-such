import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

const hint = (state: CasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-courchevel-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-courchevel-cas-secondary"]', pulses: 3 };
  return null;
};
export const courchevelCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "courchevel-cas",
  title: "Courchevel",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Omaha variant with one community card pre-flop.",
  howToPlay: "Courchevel is an Omaha Hold'em variant where one community card is dealt face-up before the pre-flop betting round, giving players partial board information from the start. After pre-flop, two more flop cards are dealt to complete the standard flop, followed by turn and river.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal four holes plus a five-card community board (with the first card visible from the start). The engine evaluates the standard Omaha rule: use exactly two hole cards plus three board cards. A stronger five-card hand than the dealer pays twelve, equal pays five, weaker pays zero. Press Next after each result.\n\nExpected score across twelve rounds is forty to one hundred. Courchevel was named for the French ski resort where it was popularized in pot-limit cash games. The pre-flop visible card sharpens early decisions and creates more texture variance. Pre-flop, look for connectors that fit the visible card.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  hint: hint, component: CasGame,
};
