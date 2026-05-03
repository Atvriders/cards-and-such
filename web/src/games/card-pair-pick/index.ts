import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPairPickState, CardPairPickAction, CardPairPickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardPairPick } from "./Game.js";

const cardPairPickSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["6", "8", "10"] as const, default: "8" as const },
} as const;

type S = SettingsOf<typeof cardPairPickSettings>;

export const cardPairPickPlugin: GamePlugin<CardPairPickState, CardPairPickAction, typeof cardPairPickSettings> = {
  id: "card-pair-pick",
  title: "Card Pair Pick",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Six cards are laid face-down. Flip two and hope they share the same rank — find the pair to score!",
  howToPlay: `Card Pair Pick is a deduction and luck game. Each round, six cards are placed face-down on the table. Exactly two of them share the same rank — your job is to find and pick those two.

Click any card to flip it face-up. Click a second card. If both selected cards share the same rank, you earn 30 points! If they do not match, you score nothing this round.

After confirming your pick, the result is shown. Press Next to continue to the next round with a fresh set of six cards.

The game guarantees exactly one matching pair among the six cards each round, so you are always looking for a hidden match. Use memory and deduction across rounds if the same ranks appear again.

Use Settings to choose 6, 8, or 10 rounds. Your final score is shown at the end. Can you find every pair for a perfect score?`,
  settings: cardPairPickSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardPairPickSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "gameover") return null;
    if (state.phase === "result") return { selector: '[data-testid="hint-target-card-pair-pick-next"]', pulses: 3 };
    if (Array.isArray(state.picks) && state.picks.length === 2) return { selector: '[data-testid="hint-target-card-pair-pick-confirm"]', pulses: 3 };
    return null;
  }, component: CardPairPick,
};
