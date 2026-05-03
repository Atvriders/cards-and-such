import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { NapState, NapAction, NapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { defaultRankOrder, legalPlays } from "../_shared/trick-engine.js";
const NapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const napoleonNapPlugin: GamePlugin<NapState, NapAction, typeof settings> = {
  id: "napoleon-nap",
  title: "Napoleon (Nap)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Nap — 5-card UK trick game.",
  howToPlay: "Nap — 5-card UK trick game. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as NapSettings),
  reducer,
  isTerminal,
  hint: (state: NapState): HintTarget | null => {
    if (state.phase !== "playing" || state.turn !== 0) return null;
    const hand = state.hands[0]!;
    if (hand.length === 0) return null;
    const legal = legalPlays(hand, state.trick);
    if (legal.length === 0) return null;
    const trick = state.trick;
    const led = trick.length > 0 ? trick[0]!.card.suit : null;
    const trump = state.trump;
    if (trick.length === 0) {
      // Leading: prefer lowest non-trump (safe), else lowest legal.
      const nonTrump = legal.filter(c => c.suit !== trump);
      const pool = nonTrump.length > 0 ? nonTrump : legal;
      const pick = pool.reduce((lo, c) =>
        defaultRankOrder(c.rank) < defaultRankOrder(lo.rank) ? c : lo,
      );
      return { selector: `[data-testid="hint-target-napc-${pick.id}"]`, pulses: 3 };
    }
    const ledCards = legal.filter(c => c.suit === led);
    if (ledCards.length > 0) {
      const onTable = trick.filter(t => t.card.suit === led).map(t => t.card);
      const highOn = onTable.reduce((hi, c) =>
        defaultRankOrder(c.rank) > defaultRankOrder(hi.rank) ? c : hi,
      );
      const winners = ledCards.filter(c => defaultRankOrder(c.rank) > defaultRankOrder(highOn.rank));
      if (winners.length > 0) {
        const pick = winners.reduce((lo, c) =>
          defaultRankOrder(c.rank) < defaultRankOrder(lo.rank) ? c : lo,
        );
        return { selector: `[data-testid="hint-target-napc-${pick.id}"]`, pulses: 3 };
      }
      const pick = ledCards.reduce((lo, c) =>
        defaultRankOrder(c.rank) < defaultRankOrder(lo.rank) ? c : lo,
      );
      return { selector: `[data-testid="hint-target-napc-${pick.id}"]`, pulses: 3 };
    }
    const trumps = legal.filter(c => c.suit === trump);
    const pool = trumps.length > 0 ? trumps : legal;
    const pick = pool.reduce((lo, c) =>
      defaultRankOrder(c.rank) < defaultRankOrder(lo.rank) ? c : lo,
    );
    return { selector: `[data-testid="hint-target-napc-${pick.id}"]`, pulses: 3 };
  },
  component: NapGame,
};
