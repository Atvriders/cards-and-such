import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WoolworthPokerState, WoolworthPokerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WoolworthPokerGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const woolworthPokerPlugin: GamePlugin<WoolworthPokerState, WoolworthPokerAction, typeof settings> = {
  id: "woolworth-poker",
  title: "Woolworth Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5s and 10s are wild cards; named for the famous five-and-dime store.",
  howToPlay: `Woolworth Poker is a single-player card-combo game. 5s and 10s are wild cards; named for the famous five-and-dime store. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.

Special rule: Each round, all 5s and 10s in your hand are wild and count as best for any pair/three/four of a kind. Bigger combos when you draw fives or tens.

Press Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.

Play continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.

The seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.`,
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  component: WoolworthPokerGame,
};
