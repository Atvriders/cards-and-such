import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BonusDeluxeVpState, BonusDeluxeVpAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BonusDeluxeVp } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const bonusDeluxeVpPlugin: GamePlugin<BonusDeluxeVpState, BonusDeluxeVpAction, typeof settings> = {
  id: "bonus-deluxe-vp",
  title: "Bonus Deluxe Video Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flat-bonus video poker — any four-of-a-kind pays same premium.",
  howToPlay: "Bonus Deluxe Video Poker is a single-player card-combo game. Flat-bonus video poker — any four-of-a-kind pays same premium. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.\n\nSpecial rule: Any four-of-a-kind pays a flat 250 chips on top of base scoring.\n\nPress Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.\n\nPlay continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.\n\nThe seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  component: BonusDeluxeVp,
};
