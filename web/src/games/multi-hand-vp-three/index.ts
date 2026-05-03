import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const multiHandVpThreePlugin: GamePlugin<CasState, CasAction, typeof settings> = {
  id: "multi-hand-vp-three",
  title: "Multi-Hand Video Poker (Three)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three simultaneous Jacks-or-Better video poker hands.",
  howToPlay: "Multi-Hand Video Poker (Three) deals three simultaneous five-card video poker hands using a single shared draw decision. After holding cards from the first hand, the held cards remain in all three hands and the remaining slots are drawn from three independent decks. Each hand pays per the Jacks-or-Better paytable.\n\nIn this single-player adaptation you play twelve rounds. Press Play each round to deal a five-card hand and three independent draws. The engine auto-holds optimal cards and evaluates all three resulting hands. Each Jacks-or-Better-and-up pays per a simplified table: pair-of-jacks=4, two-pair=8, trips=15, straight=20, flush=25, full house=35, quads=60, straight flush=150, royal=500. Press Next after each result.\n\nExpected score across twelve rounds is sixty to one hundred fifty. Multi-Hand Video Poker is among the most popular machines on casino floors thanks to high hit-frequency from three simultaneous hands. The volatility is lower per round but bankroll requirements scale with the number of hands. Aim for held-pair hits.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CasSettings),
  reducer,
  isTerminal,
  hint: (state: CasState): HintTarget | null => isTerminal(state) ? null : { selector: '[data-testid="hint-target-multi-hand-vp-three-primary"]', pulses: 3 },
  component: CasGame,
};
