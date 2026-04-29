import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PassTheTrashCardState, PassTheTrashCardAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PassTheTrashCardGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const passTheTrashCardPlugin: GamePlugin<PassTheTrashCardState, PassTheTrashCardAction, typeof settings> = {
  id: "pass-the-trash-card",
  title: "Pass the Trash (Card)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deal seven cards; pass three then two then one before showdown.",
  howToPlay: `Pass the Trash (Card) is a single-player card-combo game. Deal seven cards; pass three then two then one before showdown. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.

Special rule: You're dealt 7 cards; the 5 highest cards by rank form your scoring hand. Larger card pool = better odds for combos.

Press Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.

Play continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.

The seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.`,
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  component: PassTheTrashCardGame,
};
