import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ScrewYourNeighborCardState, ScrewYourNeighborCardAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ScrewYourNeighborCardGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const screwYourNeighborCardPlugin: GamePlugin<ScrewYourNeighborCardState, ScrewYourNeighborCardAction, typeof settings> = {
  id: "screw-your-neighbor-card",
  title: "Screw Your Neighbor (Card)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pass-or-hold card game; lowest single card loses each round.",
  howToPlay: `Screw Your Neighbor (Card) is a single-player card-combo game. Pass-or-hold card game; lowest single card loses each round. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.

Special rule: You receive 5 cards; standard hand score applies, but if your minimum-rank card is a 7 or higher, you earn a +20 'survivor' bonus.

Press Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.

Play continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.

The seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.`,
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  component: ScrewYourNeighborCardGame,
};
