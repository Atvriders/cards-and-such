import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { CountdownPokerState, CountdownPokerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CountdownPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CountdownPokerGame as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const countdownPokerPlugin: GamePlugin<CountdownPokerState, CountdownPokerAction, typeof settings> = {
  id: "countdown-poker",
  title: "Countdown Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Multi-round game where the wild card value counts down each hand.",
  howToPlay: `Countdown Poker is a single-player card-combo game. Multi-round game where the wild card value counts down each hand. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.

Special rule: Round 1: aces wild. Each subsequent round the wild rank steps down by 1 (K, Q, J, ...). Wild cards count as best for any pair/three of a kind.

Press Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.

Play continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.

The seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.`,
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-countdown-poker-deal"]', pulses: 3 };
    if (state.phase === "dealt") return { selector: '[data-testid="hint-target-countdown-poker-next"]', pulses: 3 };
    return null;
  }, component: CountdownPokerGame,
};
