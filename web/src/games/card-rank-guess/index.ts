import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardRankGuessState, CardRankGuessAction, CardRankGuessSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardRankGuess } from "./Game.js";

const cardRankGuessSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof cardRankGuessSettings>;

export const cardRankGuessPlugin: GamePlugin<CardRankGuessState, CardRankGuessAction, typeof cardRankGuessSettings> = {
  id: "card-rank-guess",
  title: "Card Rank Guess",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A card is hidden face-down. Guess its rank before the reveal — exact match wins big, close guesses earn partial credit!",
  howToPlay: `Card Rank Guess is a simple intuition game. Each round a card is drawn face-down from a standard 52-card deck. Before it is revealed, you must guess the card's rank — from 2 (lowest) through Ace (highest).

Guessing the exact rank earns you 50 points. If your guess is within two rank positions of the true rank, you earn 20 points. Anything further off scores zero.

Use your intuition, lucky feelings, or probability reasoning — roughly one in thirteen cards share each rank. The challenge is committing to a guess without any information!

After each reveal, the card is shown and your points are awarded. Press Next to draw the next card and continue. The game ends after all rounds are complete.

Use Settings to choose 5, 10, or 15 rounds. Final score is tallied at the end. Can you guess all 15 ranks perfectly?`,
  settings: cardRankGuessSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardRankGuessSettings),
  reducer, isTerminal, hint: (state: CardRankGuessState): HintTarget | null => ((state.phase === "betting" || state.phase === "reveal" || state.phase === "result") ? { selector: ".bet-btn", pulses: 3 } : null), component: CardRankGuess,
};
