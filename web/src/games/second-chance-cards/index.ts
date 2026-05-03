import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SecondChanceCardsState, SecondChanceCardsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SecondChanceCards = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SecondChanceCards as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const secondChanceCardsPlugin: GamePlugin<SecondChanceCardsState, SecondChanceCardsAction, typeof settings> = {
  id: "second-chance-cards",
  title: "Second Chance Cards",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Polyomino-card draw filling a personal grid.",
  howToPlay: "Second Chance Cards is a single-player solitaire-style card game. Polyomino-card draw filling a personal grid. Each round you draw a five-card hand from a shuffled 52-card deck and apply the variant's special rule.\n\nSpecial rule: Keep cards that 'fit' (rank ≤ 7) each round, discard others, fill 10 slots over 10 rounds.\n\nPress Play to deal the next round's hand. The score for the round is computed instantly based on which cards qualify under the rule — sometimes high cards score, sometimes pairs, sometimes runs. Round-by-round scoring is shown alongside the running total.\n\nThe game lasts ten rounds. The deck is reshuffled each round so the same lucky cards can re-appear. Strategy is in understanding which kinds of hands score best for each variant.\n\nThe shuffling is seeded so an identical run is reproducible by entering the same starting seed. When the tenth round finishes, your total is locked. Single-player only — no opponent. A perfect short-form solo card game for casual sessions, with replayability through different seeds and variant strategies.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: SecondChanceCards,
};
