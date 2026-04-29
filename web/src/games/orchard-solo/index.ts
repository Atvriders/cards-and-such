import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { OrchardSoloState, OrchardSoloAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OrchardSolo } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const orchardSoloPlugin: GamePlugin<OrchardSoloState, OrchardSoloAction, typeof settings> = {
  id: "orchard-solo",
  title: "Orchard Solo",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Apple cards overlap to score orchards.",
  howToPlay: "Orchard Solo is a single-player solitaire-style card game. Apple cards overlap to score orchards. Each round you draw a five-card hand from a shuffled 52-card deck and apply the variant's special rule.\n\nSpecial rule: 5-card hand; in 10 rounds, discard pairs (same suit) for points.\n\nPress Play to deal the next round's hand. The score for the round is computed instantly based on which cards qualify under the rule — sometimes high cards score, sometimes pairs, sometimes runs. Round-by-round scoring is shown alongside the running total.\n\nThe game lasts ten rounds. The deck is reshuffled each round so the same lucky cards can re-appear. Strategy is in understanding which kinds of hands score best for each variant.\n\nThe shuffling is seeded so an identical run is reproducible by entering the same starting seed. When the tenth round finishes, your total is locked. Single-player only — no opponent. A perfect short-form solo card game for casual sessions, with replayability through different seeds and variant strategies.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  component: OrchardSolo,
};
