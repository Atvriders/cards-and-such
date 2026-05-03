import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { RedDogCardState, RedDogCardAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RedDogCardGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RedDogCardGame as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const redDogCardPlugin: GamePlugin<RedDogCardState, RedDogCardAction, typeof settings> = {
  id: "red-dog-card",
  title: "Red Dog (Card)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Casino game; bet that a third card falls between two dealt cards.",
  howToPlay: `Red Dog (Card) is a single-player card-combo game. Casino game; bet that a third card falls between two dealt cards. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.

Special rule: Each round you receive 3 cards. If card 3's rank lies strictly between cards 1 and 2, score is doubled; ties earn a small bonus.

Press Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.

Play continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.

The seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.`,
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-red-dog-card-deal"]', pulses: 3 };
    if (state.phase === "dealt") return { selector: '[data-testid="hint-target-red-dog-card-next"]', pulses: 3 };
    return null;
  }, component: RedDogCardGame,
};
