import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DilemmaDeckState, DilemmaDeckAction, DilemmaDeckSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DilemmaDeckGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DilemmaDeckGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const dilemmaDeckPlugin: GamePlugin<DilemmaDeckState, DilemmaDeckAction, typeof settings> = {
  id: "dilemma-deck", title: "Dilemma Deck", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dilemma philosophical-choice trivia. Match the philosopher to the dilemma.",
  howToPlay: "Dilemma Deck is inspired by the experimental art-game Dilemma Deck, where philosophical choice cards prompt argument and group voting. Each of twelve rounds presents a famous philosophical dilemma and asks which philosopher is most associated with it. Ten points per correct, 120 max. Dilemmas covered include the Trolley Problem (Foot/Thomson), Ship of Theseus (Plutarch/Hobbes), Theseus's Labyrinth, Buridan's Ass, Pascal's Wager, Schrodinger's Cat (also a thought-experiment), Plato's Cave, the Veil of Ignorance (Rawls), and the Categorical Imperative (Kant). Philosophy students nail 100+; general audiences should still clear 60-80. Run takes around two minutes. Submit each guess and Next to advance. The original Dilemma Deck is a small-press art-game project that fits in your pocket and starts genuinely interesting arguments at parties — it's part of the same wave that includes The Quiet Year and similar narrative-prompt card decks.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DilemmaDeckSettings),
  reducer, isTerminal, hint: (state: DilemmaDeckState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-dilemma-deck-answer-0"]', pulses: 3 } : null, component: DilemmaDeckGame,
};
