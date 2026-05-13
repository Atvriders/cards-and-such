import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SkipBoFullState, SkipBoFullAction, SkipBoFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const SkipBoFull = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((m) => ({
    default: m.SkipBoFullGame as unknown as React.ComponentType<unknown>,
  })),
);

export const skipBoFullSettings = {
  cpuCount: {
    kind: "number" as const,
    label: "CPU opponents",
    min: 1, max: 3, step: 1, default: 3,
  },
  stockSize: {
    kind: "enum" as const,
    label: "Stockpile size",
    options: ["10", "20", "30"] as const,
    default: "30" as const,
  },
} as const;

type SettingsType = SettingsOf<typeof skipBoFullSettings>;

function adapt(s: SettingsType): SkipBoFullSettings {
  const cc = Math.min(3, Math.max(1, Math.round(s.cpuCount))) as 1 | 2 | 3;
  const sz = (Number(s.stockSize) === 10 ? 10 : Number(s.stockSize) === 20 ? 20 : 30) as 10 | 20 | 30;
  return { cpuCount: cc, stockSize: sz };
}

export const skipBoFullPlugin: GamePlugin<SkipBoFullState, SkipBoFullAction, typeof skipBoFullSettings> = {
  id: "skip-bo-full",
  title: "Skip-Bo (Full Sequential Stack)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race to empty your stockpile by building sequential 1-12 stacks in the center; wilds skip the gap.",
  howToPlay:
    `Skip-Bo (Full Sequential Stack) is the complete shedding game played 1 vs 3 CPU opponents.\n\n` +
    `Setup: A 162-card deck (twelve each of 1-12 plus eighteen Skip-Bo wilds) is shuffled. Each player receives a face-down stockpile of 30 cards; the top of the stockpile is always face-up to its owner. The remaining cards form a draw pile.\n\n` +
    `On each turn: draw up to a hand of 5 cards. Play cards onto one of the four shared center build piles, which build sequentially from 1 to 12. When a build pile reaches 12 it is removed and returned to the draw recycle. You may play from your hand, the top of your stockpile, or the top of any of your four personal discard piles. A Skip-Bo card is wild and represents the next required number. If you empty your hand mid-turn, refill immediately and continue. The turn ends only when you place a hand card on one of your four personal discard piles (any card to any pile). First to empty their stockpile wins.\n\n` +
    `Strategy: prioritize playing from the top of your stockpile to shrink it. Keep discard piles roughly sorted (e.g. one for high cards, one for mid, one flexible) so you don't bury cards you'll need. Save Skip-Bo wilds for unblocking your stockpile.\n\n` +
    `Score: 100 + 1 point for each card remaining in the opponents' stockpiles when you go out. A loss scores zero.`,
  settings: skipBoFullSettings,
  initialState: (seed: number, s: SettingsType) => initialState(seed, adapt(s)),
  reducer,
  isTerminal,
  hint: (state) => {
    if (state.phase === "done") return null;
    if (state.turn !== 0) return null;
    // Prefer playing the stockpile top if it can play, then any hand card.
    const sb = state.seats[0]!;
    const buildReq = (b: number) => state.buildPiles[b]!.length + 1;
    const playable = (v: number) => {
      for (let b = 0; b < 4; b++) if (v === 0 || v === buildReq(b)) return true;
      return false;
    };
    const stockTop = sb.stock.at(-1);
    if (stockTop && playable(stockTop.value)) {
      return { selector: '[data-testid="skipbof-stock"]', pulses: 3 };
    }
    for (let i = 0; i < sb.hand.length; i++) {
      const c = sb.hand[i];
      if (c && playable(c.value)) return { selector: `[data-testid="skipbof-hand-${i}"]`, pulses: 3 };
    }
    for (let i = 0; i < sb.discards.length; i++) {
      const top = sb.discards[i]!.at(-1);
      if (top && playable(top.value)) return { selector: `[data-testid="skipbof-discard-src-${i}"]`, pulses: 3 };
    }
    // Nothing playable — hint to dump a hand card to a discard pile to end turn.
    for (let i = 0; i < sb.hand.length; i++) {
      if (sb.hand[i]) return { selector: `[data-testid="skipbof-hand-${i}"]`, pulses: 3 };
    }
    return { selector: '[data-testid="skipbof-primary"]', pulses: 3 };
  },
  component: SkipBoFull,
};
