import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CribbageSquaresSoliState, CribbageSquaresSoliAction, CribbageSquaresSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CribbageSquaresSoliGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CribbageSquaresSoliGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: CribbageSquaresSoliState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-cribbage-squares-soli-primary"]', pulses: 3 };
  if (state.phase === "result") return { selector: '[data-testid="hint-target-cribbage-squares-soli-secondary"]', pulses: 3 };
  return null;
};

export const cribbageSquaresSoliPlugin: GamePlugin<CribbageSquaresSoliState, CribbageSquaresSoliAction, typeof settings> = {
  id: "cribbage-squares-soli", title: "Cribbage Squares Solitaire", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solitaire Cribbage Squares: place 10 cards luckily into a peg-friendly grid.",
  howToPlay: "Cribbage Squares Solitaire is normally played by placing 16 cards in a 4×4 grid and scoring rows and columns as cribbage hands. This streamlined version reduces it to a luck-only \"lucky placement\" race: across ten placements, each pair of cards drawn either pegs a small score together or falls flat.\n\nEach round, draw two cards from a 52-card deck. If their ranks differ, you score 10 points (the placement landed in a high-scoring row). If they tie in rank — a pair, automatically worth two points in real cribbage — you score 3 points. Same-suit consolation does not apply here.\n\nTen rounds total. Expected score lands near 70 points (cards rarely pair, so the larger payoff dominates). Very unlucky runs with several ties can sink below 50.\n\nThe full Cribbage Squares Solitaire requires choice and grid positioning. This entry models the rolling luck-of-the-cut without the placement decisions, ideal for a pure-chance cribbage moment.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CribbageSquaresSoliSettings),
  reducer, isTerminal, hint: hint, component: CribbageSquaresSoliGame,
};
