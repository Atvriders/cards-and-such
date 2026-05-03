import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { FieryCrossPokerState, FieryCrossPokerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FieryCrossPokerGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const fieryCrossPokerPlugin: GamePlugin<FieryCrossPokerState, FieryCrossPokerAction, typeof settings> = {
  id: "fiery-cross-poker",
  title: "Fiery Cross Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Community cards arranged in a cross; use one row or column for your hand.",
  howToPlay: `Fiery Cross Poker is a single-player card-combo game. Community cards arranged in a cross; use one row or column for your hand. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.

Special rule: You receive a 5-card hand. The hand is scored twice: as 5 cards normally and as a 'horizontal arm' bonus (best 3 cards) — both add to your score.

Press Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.

Play continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.

The seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.`,
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-fiery-cross-poker-deal"]', pulses: 3 };
    if (state.phase === "dealt") return { selector: '[data-testid="hint-target-fiery-cross-poker-next"]', pulses: 3 };
    return null;
  }, component: FieryCrossPokerGame,
};
