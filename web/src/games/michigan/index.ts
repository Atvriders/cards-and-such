import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MichiganState } from "./state.js";
import type { Suit } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MichiganGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MichiganGame as unknown as React.ComponentType<unknown> })));
export const michiganSettings = {
  dummy: { kind: "enum" as const, label: "Mode", options: ["off"] as const, default: "off" as const },
} as const;

type MichiganAction =
  | { type: "play"; cardId: string }
  | { type: "changeSuit"; suit: Suit };

export const michiganPlugin: GamePlugin<MichiganState, MichiganAction, typeof michiganSettings> = {
  id: "michigan",
  title: "Michigan",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "American stops game. Play sequences up through a suit, changing suits when blocked. First to empty hand wins.",
  howToPlay: `Michigan (also called Boodle or Newmarket) is a classic American stops card game for 4 players. You play against three bots.

Setup: all 52 cards are dealt (13 each). You lead the first card from your hand, starting a sequence.

Sequences: play flows up through a suit. Whoever holds the next card in the same suit (rank + 1) must play it. Play continues up until a King (the highest) is reached or no one has the next card.

Changing suit: when a sequence is blocked (no one has the next card, or King was played), the last player to play must lead a new card in a different suit, starting a fresh sequence.

Strategy: lead from your longest suit to advance quickly. Try to create sequences that end at your high cards. If you hold cards that follow from an opponent's lead, play them promptly.

Winning: the first player to shed all 13 cards wins (score 100). Second place = 60, third = 30. If the game ends without you finishing, score is based on remaining cards.

The game is a classic "stops" game — sequences stop when the holding is in the dead hand or the card is a King, adding an element of chance to the strategic play.`,
  settings: michiganSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: MichiganState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-michigan-primary"]', pulses: 3 };
  },
  component: MichiganGame,
};
