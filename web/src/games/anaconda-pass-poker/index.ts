import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { AnacondaPassPokerState, AnacondaPassPokerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AnacondaPassPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AnacondaPassPokerGame as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const anacondaPassPokerPlugin: GamePlugin<AnacondaPassPokerState, AnacondaPassPokerAction, typeof settings> = {
  id: "anaconda-pass-poker",
  title: "Anaconda Pass Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pass-cards game; players pass three, then two, then one before showdown.",
  howToPlay: `Anaconda Pass Poker is a single-player card-combo game. Pass-cards game; players pass three, then two, then one before showdown. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.

Special rule: After the 7-card deal, the worst 2 cards are auto-discarded (passing in classic Anaconda) and the remaining 5 are scored for hand strength.

Press Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.

Play continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.

The seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.`,
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-anaconda-pass-poker-deal"]', pulses: 3 };
    if (state.phase === "dealt") return { selector: '[data-testid="hint-target-anaconda-pass-poker-next"]', pulses: 3 };
    return null;
  }, component: AnacondaPassPokerGame,
};
