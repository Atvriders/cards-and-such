import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SpitInOceanState, SpitInOceanAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpitInOceanGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

const hint = (state: SpitInOceanState): HintTarget | null => ((state.phase === "ready" || state.phase === "dealt") ? { selector: ".g-btn", pulses: 3 } : null);

export const spitInOceanPlugin: GamePlugin<SpitInOceanState, SpitInOceanAction, typeof settings> = {
  id: "spit-in-ocean",
  title: "Spit in the Ocean",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw variant where one community card is wild for the whole table.",
  howToPlay: `Spit in the Ocean is a single-player card-combo game. Draw variant where one community card is wild for the whole table. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.

Special rule: A single wild card rank rotates each round (the rng selects); your hand earns +30 if you hold any card matching that wild rank.

Press Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.

Play continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.

The seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.`,
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer, isTerminal, hint, component: SpitInOceanGame,
};
