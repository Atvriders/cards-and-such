import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { FollowQueenRankState, FollowQueenRankAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FollowQueenRank = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FollowQueenRank as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;

export const followQueenRankPlugin: GamePlugin<FollowQueenRankState, FollowQueenRankAction, typeof settings> = {
  id: "follow-queen-rank",
  title: "Follow the Queen Rank",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "7-Stud variant where the rank following each Queen becomes wild.",
  howToPlay: "Follow the Queen Rank is a single-player card-combo game. 7-Stud variant where the rank following each Queen becomes wild. Each round you receive a five-card hand from a shuffled 52-card deck and score points based on the strongest poker-style combo present.\n\nSpecial rule: Each round, after dealing 5 cards we mark the rank after a queen as wild — wilds count as best for any pair/three of a kind.\n\nPress Deal to receive a new five-card hand. The score for that hand is computed instantly using the variant's scoring table — pairs, two-pair, three-of-a-kind, straight, flush, full house, four-of-a-kind, straight flush. Bonus or wild rules adjust the totals up.\n\nPlay continues for ten rounds, accumulating points. The deck reshuffles each round so high cards are always available. Aim for the highest possible cumulative score by riding lucky deals.\n\nThe seed determines the entire shuffle sequence, so you can replay an identical run by entering the same seed. After ten rounds, your final score is locked in. Single-player only — no CPU opponent. A bite-sized poker variant perfect for short play sessions.",
  settings,
  initialState: (seed, _s) => initialState(seed, { rounds: "10" }),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-follow-queen-rank-deal"]', pulses: 3 };
    if (state.phase === "dealt") return { selector: '[data-testid="hint-target-follow-queen-rank-next"]', pulses: 3 };
    return null;
  }, component: FollowQueenRank,
};
