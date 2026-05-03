import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BriscolaState, BriscolaAction, BriscolaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { defaultRankOrder, legalPlays } from "../_shared/trick-engine.js";
const BriscolaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BriscolaGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const briscolaPlugin: GamePlugin<BriscolaState, BriscolaAction, typeof settings> = {
  id: "briscola",
  title: "Briscola",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Briscola — Italian 40-card trump game.",
  howToPlay: "Briscola — Italian 40-card trump game. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as BriscolaSettings),
  reducer,
  isTerminal,
  hint: (state: BriscolaState): HintTarget | null => {
    if (state.phase !== "playing" || state.turn !== 0) return null;
    const hand = state.hands[0]!;
    if (hand.length === 0) return null;
    const legal = legalPlays(hand, state.trick);
    const candidates = legal.length > 0 ? legal : [...hand];
    const trump = state.trump;
    // Briscola point values
    const pts = (rank: number): number => {
      if (rank === 1) return 11;
      if (rank === 3) return 10;
      if (rank === 13) return 4;
      if (rank === 12) return 3;
      if (rank === 11) return 2;
      return 0;
    };
    const trumps = candidates.filter(c => c.suit === trump);
    const nonTrumps = candidates.filter(c => c.suit !== trump);
    let pick = candidates[0]!;
    if (trumps.length > 0) {
      // Highest-value trump
      pick = trumps.reduce((best, c) =>
        pts(c.rank) > pts(best.rank) ||
        (pts(c.rank) === pts(best.rank) && defaultRankOrder(c.rank) > defaultRankOrder(best.rank))
          ? c : best,
      );
    } else if (nonTrumps.length > 0) {
      // Lowest-value non-trump
      pick = nonTrumps.reduce((lo, c) =>
        pts(c.rank) < pts(lo.rank) ||
        (pts(c.rank) === pts(lo.rank) && defaultRankOrder(c.rank) < defaultRankOrder(lo.rank))
          ? c : lo,
      );
    }
    return { selector: `[data-testid="hint-target-brisc-${pick.id}"]`, pulses: 3 };
  },
  component: BriscolaGame,
};
