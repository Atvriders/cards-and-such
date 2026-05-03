import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { AceyDeuceyInBetweenState, AceyDeuceyInBetweenAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AceyDeuceyInBetweenGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const aceyDeuceyInBetweenPlugin: GamePlugin<AceyDeuceyInBetweenState, AceyDeuceyInBetweenAction, typeof settings> = {
  id: "acey-deucey-in-between",
  title: "Acey-Deucey (In Between)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bet whether the next card falls between two dealt cards in rank.",
  howToPlay: `Acey-Deucey (In Between) is a single-player card-combo game. Bet whether the next card falls between two dealt cards in rank. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.

Special rule: After dealing 3 cards, you score points if the third card's rank falls strictly between the first two; otherwise score is just hand strength.

Press Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.

Play continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.

The seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.`,
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  hint: (state: AceyDeuceyInBetweenState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-acey-deucey-in-between-primary"]', pulses: 3 } : null),
  component: AceyDeuceyInBetweenGame,
};
