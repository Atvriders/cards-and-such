import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SpitState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Spit = /* @__PURE__ */ lazy(() => import("./Spit.js").then((mod) => ({ default: mod.Spit as unknown as React.ComponentType<unknown> })));
export const spitSettings = {
  botSpeed: {
    kind: "enum" as const,
    label: "Bot Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type SpitAction =
  | { type: "play"; reserveIdx: number; centerIdx: 0 | 1 }
  | { type: "spit" }
  | { type: "bot-tick" }
  | { type: "restart" };

export const spitPlugin: GamePlugin<SpitState, SpitAction, typeof spitSettings> = {
  id: "spit",
  title: "Spit",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simultaneous card shedding — play to center piles ±1 rank. When stuck, SPIT to refresh.",
  howToPlay: `Spit is a two-player simultaneous card-shedding race. Both players play as fast as they can with no turns.

Setup: each player receives 26 cards. Five reserve piles are dealt face-up (one card each). The remaining cards form your Spit pile (stock). Two center piles start with one card each face-up.

Playing: you can play the top card of any reserve pile to either center pile if its rank is exactly one higher or lower than the center pile's top card. Ace (1) wraps: it can be played on a King (13) and vice versa. Click a reserve card to auto-play it to a valid center pile.

When stuck: if neither player can make any move, click SPIT! — the top card of each spit pile is flipped onto the two center piles, giving everyone new options. The bot will automatically trigger SPIT when it detects the game is stuck.

After a play: refill empty reserve slots from your spit pile if needed.

Winning: the first player to empty all their reserve piles and their spit pile wins the round. Score 100 for winning, 0 for losing.

Tips: scan both center piles after every play — a card blocked on one pile may fit the other. Keep all five reserve slots active; an empty slot is wasted potential.`,
  settings: spitSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-spit-action"]', pulses: 3 }; },
  component: Spit,
};
