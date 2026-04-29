import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { UnderwaterCitiesRwState, UnderwaterCitiesRwAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UnderwaterCitiesRw } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const underwaterCitiesRwPlugin: GamePlugin<UnderwaterCitiesRwState, UnderwaterCitiesRwAction, typeof settings> = {
  id: "underwater-cities-rw",
  title: "Underwater Cities R&W",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build undersea tunnels and domes.",
  howToPlay: "Underwater Cities R&W is a single-player solitaire-style card game. Build undersea tunnels and domes. Each round you draw a five-card hand from a shuffled 52-card deck and apply the variant's special rule.\n\nSpecial rule: 5-card hand for 10 rounds; collect runs (consecutive ranks) for big bonuses.\n\nPress Play to deal the next round's hand. The score for the round is computed instantly based on which cards qualify under the rule — sometimes high cards score, sometimes pairs, sometimes runs. Round-by-round scoring is shown alongside the running total.\n\nThe game lasts ten rounds. The deck is reshuffled each round so the same lucky cards can re-appear. Strategy is in understanding which kinds of hands score best for each variant.\n\nThe shuffling is seeded so an identical run is reproducible by entering the same starting seed. When the tenth round finishes, your total is locked. Single-player only — no opponent. A perfect short-form solo card game for casual sessions, with replayability through different seeds and variant strategies.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  component: UnderwaterCitiesRw,
};
