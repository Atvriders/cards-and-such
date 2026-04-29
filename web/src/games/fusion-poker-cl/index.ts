import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FusionPokerClState, FusionPokerClAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FusionPokerClGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const fusionPokerClPlugin: GamePlugin<FusionPokerClState, FusionPokerClAction, typeof settings> = {
  id: "fusion-poker-cl",
  title: "Fusion Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hold'em/PLO hybrid; one hole card switches with a community card.",
  howToPlay: `Fusion Poker is a single-player card-combo game. Hold'em/PLO hybrid; one hole card switches with a community card. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.

Special rule: After scoring, your weakest card is automatically swapped for a community card if it improves your hand — score reflects the better of the two.

Press Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.

Play continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.

The seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.`,
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  component: FusionPokerClGame,
};
