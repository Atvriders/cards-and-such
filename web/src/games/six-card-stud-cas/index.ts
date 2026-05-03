import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SixCardStudCasState, SixCardStudCasAction, SixCardStudCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SixCardStudCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SixCardStudCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: SixCardStudCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-six-card-stud-cas-secondary"]', pulses: 3 };
  return null;
};
export const sixCardStudCasPlugin: GamePlugin<SixCardStudCasState, SixCardStudCasAction, typeof settings> = {
  id: "six-card-stud-cas", title: "Six-Card Stud (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Casino six-card stud variant against the dealer.",
  howToPlay: "Six-Card Stud is a historical stud-poker variant filling the gap between Five-Card and Seven-Card Stud. Each player receives one down card and five up cards, with multiple betting rounds.\n\nIn this casino-style adaptation you play against the dealer over twelve rounds. Each round you receive five cards and see five dealer cards (the sixth-card mechanic is approximated by extra hand-strength bonuses for premium combinations). You may play (compare) or fold (forfeit). The comparison uses card-sum across all cards.\n\nA win pays fourteen points (with a king-high bonus of three additional); a tie pays five; a fold or loss pays zero. Twelve rounds are played.\n\nExpected score across twelve rounds is sixty to ninety. Six-Card Stud's middle-ground intensity is captured here by the consistent five-card comparison — every card matters and small edges accumulate. Fold trash, play average-or-better. A king-high winning hand pushes you toward the upper band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SixCardStudCasSettings),
  reducer, isTerminal, hint: hint, component: SixCardStudCasGame,
};
