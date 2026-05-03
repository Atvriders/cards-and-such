import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { PresidentsState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PresidentsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PresidentsGame as unknown as React.ComponentType<unknown> })));
export const presidentsSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["1", "2", "3"] as const, default: "3" as const },
} as const;

type PresidentsAction =
  | { type: "play"; cardIds: string[] }
  | { type: "pass" }
  | { type: "selectSwapCard"; cardId: string }
  | { type: "confirmSwap" }
  | { type: "nextRound" };

export const presidentsPlugin: GamePlugin<PresidentsState, PresidentsAction, typeof presidentsSettings> = {
  id: "presidents",
  title: "Presidents",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Multi-round climbing game with card swaps. President and Scum swap cards between rounds.",
  howToPlay: `Presidents (also known as Scum or Asshole) is a multi-round climbing card game with social status mechanics.

Gameplay: 52 cards are dealt to 4 players. On your turn, play one or more cards of the same rank that beat the last play. Pass if you cannot or choose not to. Once all other players pass, the last player to play leads freely. The first to empty their hand is President; last is Scum.

Card ranking: 3 is lowest, rising through normal order to Ace, with 2 as the highest card.

Card swaps: at the start of each subsequent round, President and Scum swap cards. If you are President, choose 1 card to give Scum and receive Scum's single best card in return. If you are Scum, choose 1 card to surrender to President. This shifts the balance of power each round.

Match: the game ends after the target number of rounds. The player with more round wins is champion.

Strategy: watch which ranks opponents hold and try to exhaust suits that force them to pass. Climbing slowly with low cards often beats dumping high cards early.`,
  settings: presidentsSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: PresidentsState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-presidents-primary"]', pulses: 3 };
  },
  component: PresidentsGame,
};
