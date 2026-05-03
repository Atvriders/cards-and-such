import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { DoubleDoubleBonusVpState, DoubleDoubleBonusVpAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DoubleDoubleBonusVp = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DoubleDoubleBonusVp as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const doubleDoubleBonusVpPlugin: GamePlugin<DoubleDoubleBonusVpState, DoubleDoubleBonusVpAction, typeof settings> = {
  id: "double-double-bonus-vp",
  title: "Double Double Bonus VP",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Premium kicker payouts on four-of-a-kind hands.",
  howToPlay: "Double Double Bonus VP is a single-player card-combo game. Premium kicker payouts on four-of-a-kind hands. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.\n\nSpecial rule: Four-aces pays huge; four 2-3-4 with kicker also boosts.\n\nPress Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.\n\nPlay continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.\n\nThe seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer,
  isTerminal,
  hint: (state: DoubleDoubleBonusVpState): HintTarget | null => isTerminal(state) ? null : { selector: '[data-testid="hint-target-double-double-bonus-vp-primary"]', pulses: 3 },
  component: DoubleDoubleBonusVp,
};
