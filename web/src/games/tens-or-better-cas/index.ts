import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { TensOrBetterCasState, TensOrBetterCasAction, TensOrBetterCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TensOrBetterCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TensOrBetterCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: TensOrBetterCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-tens-or-better-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-tens-or-better-cas-secondary"]', pulses: 3 };
  return null;
};
export const tensOrBetterCasPlugin: GamePlugin<TensOrBetterCasState, TensOrBetterCasAction, typeof settings> = {
  id: "tens-or-better-cas", title: "Tens or Better (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lower-qualifying VP variant.",
  howToPlay: "Tens or Better is a Jacks or Better video poker variant where the minimum qualifying hand is a pair of tens (instead of jacks). The lower threshold means more hands pay but the rest of the paytable is reduced to compensate.\n\nIn this single-player version you play fifteen rounds. Press Play each round to deal five cards. Optimal holds are chosen and replacements drawn. The hand is paid per the Tens or Better paytable.\n\nKey payouts: pair of tens or better pays one; two pair one; trips three; straight four; flush five; full house six; four of a kind twenty-five; straight flush fifty; royal flush eight hundred.\n\nThe lower minimum is forgiving for casual players and reduces variance. The house edge is comparable to Jacks or Better with optimal play. A strong total across fifteen rounds is around two hundred and fifty.\n\nTens or Better is offered at many online video poker sites and on bartop machines in Reno casinos. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TensOrBetterCasSettings),
  reducer, isTerminal, hint: hint, component: TensOrBetterCasGame,
};
