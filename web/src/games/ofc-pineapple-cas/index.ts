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
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-ofc-pineapple-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-ofc-pineapple-cas-secondary"]', pulses: 3 };
  return null;
};
export const ofcPineappleCasPlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "ofc-pineapple-cas",
  title: "OFC Pineapple",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Open-Face Chinese Poker variant with three cards dealt at a time.",
  howToPlay: "OFC Pineapple is an Open-Face Chinese Poker variant where each player receives three cards at a time (instead of one) and places two while discarding one, repeating until thirteen cards are committed across three rows (top three-card, middle five-card, bottom five-card). The bottom row must be the strongest.\n\nIn this single-player adaptation you play twelve rounds against the dealer. Press Play each round to deal thirteen cards and have the engine auto-allocate them into the three rows. The engine evaluates row strength against the dealer: each row won pays four, sweeping all three pays sixteen, fouling (rows misordered) pays zero. Press Next after each result.\n\nExpected score across twelve rounds is fifty to one hundred. OFC Pineapple is faster than standard OFC because three-at-a-time dealing reduces the time per hand. Royalties (bonuses for big hands) are central to OFC strategy in cash play. Watch the row order — fouling is the worst outcome.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  hint: hint, component: CasGame,
};
