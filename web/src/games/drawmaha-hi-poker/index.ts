import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { DrawmahaHiPokerState, DrawmahaHiPokerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DrawmahaHiPokerGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

const hint = (state: DrawmahaHiPokerState): HintTarget | null => ((state.phase === "ready" || state.phase === "dealt") ? { selector: ".g-btn", pulses: 3 } : null);

export const drawmahaHiPokerPlugin: GamePlugin<DrawmahaHiPokerState, DrawmahaHiPokerAction, typeof settings> = {
  id: "drawmaha-hi-poker",
  title: "Drawmaha Hi",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Omaha Hi variant with an additional draw round after the flop.",
  howToPlay: `Drawmaha Hi is a single-player card-combo game. Omaha Hi variant with an additional draw round after the flop. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.

Special rule: After the initial 5-card deal, you may automatically swap up to 2 worst cards for new ones — best 5-card hand from the resulting 7 is scored.

Press Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.

Play continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.

The seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.`,
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer, isTerminal, hint, component: DrawmahaHiPokerGame,
};
