import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { NineCardBragState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NineCardBragGame } from "./Game.js";

export const nineCardBragSettings = {
  rounds: { kind: "enum" as const, label: "First to", options: ["3", "5", "7"] as const, default: "3" as const },
} as const;

type NineCardBragAction =
  | { type: "toggleCard"; index: number }
  | { type: "confirmGroup" }
  | { type: "resetArrangement" }
  | { type: "reveal" }
  | { type: "newRound" };

export const nineCardBragPlugin: GamePlugin<NineCardBragState, NineCardBragAction, typeof nineCardBragSettings> = {
  id: "nine-card-brag",
  title: "Nine-Card Brag",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "British card game. Arrange 9 cards into 3 brag hands of 3. Win 2 of 3 hands to take the round.",
  howToPlay: `Nine-Card Brag is a classic British game where strategy lies in how you arrange your hand.

Setup: each player receives 9 cards. You must arrange them into 3 separate brag hands of 3 cards each. The bot arranges its hand automatically.

Brag hand rankings (highest to lowest): Prial (three of a kind) — special note, Prial of 3s beats Prial of Aces! Then: Straight Flush, Flush, Straight, Pair, High Card.

Arranging: click cards in your hand to select groups of 3, then confirm each hand. You can reset and start over at any time before revealing.

Scoring rounds: after both sides arrange, the hands are revealed and compared position by position (your Hand 1 vs Bot Hand 1, etc.). Win 2 or more comparisons and you take the round.

Match: first player to win the target number of rounds (3, 5, or 7) wins the match.

Strategy: you may sacrifice one hand to strengthen the other two. A Prial in one hand with decent pairs in the others often beats a set of middling flushes.`,
  settings: nineCardBragSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: NineCardBragState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-nine-card-brag-primary"]', pulses: 3 };
  },
  component: NineCardBragGame,
};
