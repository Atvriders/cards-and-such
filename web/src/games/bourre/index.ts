import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BourreState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Bourre = /* @__PURE__ */ lazy(() => import("./Bourre.js").then((mod) => ({ default: mod.Bourre as unknown as React.ComponentType<unknown> })));
const bourreSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type BourreSettingsType = SettingsOf<typeof bourreSettings>;

type BourreAction =
  | { type: "fold" }
  | { type: "stay" }
  | { type: "play"; cardId: string };

export const bourrePlugin: GamePlugin<BourreState, BourreAction, typeof bourreSettings> = {
  id: "bourre",
  title: "Bourré",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cajun Louisiana trick-taking game — win at least one trick or lose the pot!",
  howToPlay: `Bourré (pronounced "boo-ray") is the classic card game of Louisiana's Cajun country, played at every family gathering and social club in the region.

Each player receives 5 cards from a standard 52-card deck. A card is flipped to determine the trump suit. Before play begins, each player must decide to stay in or fold. Folding costs nothing; staying and winning no tricks (being "bourréd") means you lose the pot.

Trump suit beats all other suits. Within suits, cards rank Ace high (A, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2). You must follow the led suit if you can; if you cannot follow suit, you MUST play trump if you have it.

Winning: The player who wins the most tricks takes the pot. If you take zero tricks after staying in, you're bourréd and must add to the pot.

First decide: Stay In or Fold. Then click cards to play. Legal moves are highlighted.`,
  settings: bourreSettings,
  initialState: (seed: number, settings: BourreSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "fold-or-play" && state.turn === 0) return { selector: '[data-testid="hint-target-bourre-stay"]', pulses: 3 };
    return null;
  },
  component: Bourre,
};
