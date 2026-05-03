import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MississippiStudState, MississippiStudAction } from "./state.js";
import { initialState, reducer, isTerminal, visibleCommunity } from "./state.js";
const MississippiStudGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MississippiStudGame as unknown as React.ComponentType<unknown> })));
export const mississippiStudSettings = {
  anteSize: {
    kind: "enum" as const,
    label: "Ante Size",
    options: ["5", "10", "25"] as const,
    default: "10",
  },
  hands: {
    kind: "enum" as const,
    label: "Hands per Session",
    options: ["5", "10", "20"] as const,
    default: "10",
  },
} as const;

type Settings = SettingsOf<typeof mississippiStudSettings>;

export const mississippiStudPlugin: GamePlugin<MississippiStudState, MississippiStudAction, typeof mississippiStudSettings> = {
  id: "mississippi-stud",
  title: "Mississippi Stud",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5-card stud variant. Ante then raise 1–3× on each of three streets. Pay table on final hand.",
  howToPlay: `Mississippi Stud is a five-card stud poker variant where you play against a pay table rather than against the dealer. Your goal is to make the best five-card hand from your two hole cards and three community cards.

Flow: Pay an ante, receive two hole cards. Three community cards are dealt face-down. Over three streets — 3rd, 4th, and 5th — one community card is revealed at a time. Before each reveal you must either Fold (lose all bets so far) or Bet 1×, 2×, or 3× the original ante.

Final hand: After the 5th street bet, all five cards are evaluated. You must have a pair of 6s or better to win. Pay table (on total amount wagered): Pair of 6s through Kings → 1:1, Two Pair → 2:1, Three of a Kind → 3:1, Straight → 4:1, Flush → 6:1, Full House → 10:1, Four of a Kind → 40:1, Straight Flush → 100:1. Pair of 2s through 5s and high-card hands lose.

Strategy: Always continue with a pair. With three-to-a-flush or three-to-a-straight after the flop, consider betting 3× on 4th street. Fold low unsuited unpaired holdings early — the progressive bet structure means losses compound quickly.`,
  settings: mississippiStudSettings,
  initialState: (seed: number, settings: Settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: MississippiStudState): HintTarget | null => {
    if (state.phase === "ante" || state.phase === "settled") {
      if (state.bankroll <= 0) return null;
      return { selector: '[data-testid="hint-target-mississippi-stud-deal"]', pulses: 3 };
    }
    if (state.phase !== "third-street" && state.phase !== "fourth-street" && state.phase !== "fifth-street") return null;
    // Pot-odds analogue: each bet costs anteX vs paytable EV. Use simple hand strength.
    const visible = [
      ...state.playerCards,
      ...state.communityCards.slice(0, visibleCommunity(state.phase)),
    ];
    const ranks = visible.map((c) => (c.rank === 1 ? 14 : c.rank));
    const counts = new Map<number, number>();
    for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
    const pairs = [...counts.entries()].filter(([, v]) => v >= 2);
    const hasHighPair = pairs.some(([r, v]) => v >= 2 && r >= 6);
    const hasLowPair = pairs.some(([r, v]) => v >= 2 && r < 6);
    const trips = pairs.some(([, v]) => v >= 3);
    if (trips || hasHighPair) return { selector: '[data-testid="hint-target-mississippi-stud-bet3"]', pulses: 3 };
    // Three-to-flush or three-to-straight on 4th street: bet 2x.
    const suits = visible.map((c) => c.suit);
    const suitCounts = new Map<string, number>();
    for (const s of suits) suitCounts.set(s, (suitCounts.get(s) ?? 0) + 1);
    const flushDraw = [...suitCounts.values()].some((v) => v >= 3);
    if (flushDraw && !hasLowPair) return { selector: '[data-testid="hint-target-mississippi-stud-bet2"]', pulses: 3 };
    if (hasLowPair) return { selector: '[data-testid="hint-target-mississippi-stud-fold"]', pulses: 3 };
    // High cards (J+) — fold trash.
    const highs = ranks.filter((r) => r >= 11).length;
    if (highs >= 2) return { selector: '[data-testid="hint-target-mississippi-stud-bet1"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-mississippi-stud-fold"]', pulses: 3 };
  },
  component: MississippiStudGame,
};
