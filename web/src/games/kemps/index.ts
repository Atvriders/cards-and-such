import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KempsState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Kemps = /* @__PURE__ */ lazy(() => import("./Kemps.js").then((mod) => ({ default: mod.Kemps as unknown as React.ComponentType<unknown> })));
export const kempsSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds to Win",
    options: ["3", "5"] as const,
    default: "3" as const,
  },
} as const;

type KempsAction =
  | { type: "swap"; handIdx: number; centerIdx: number }
  | { type: "signal" }
  | { type: "stop-kemps" }
  | { type: "next-round" }
  | { type: "bot-tick" }
  | { type: "restart" };

export const kempsPlugin: GamePlugin<KempsState, KempsAction, typeof kempsSettings> = {
  id: "kemps",
  title: "Kemps",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Team card game — build 4-of-a-kind and signal your partner to call KEMPS!",
  howToPlay: `Kemps is a 4-player team card game (2 teams of 2). You play with a bot partner against two bot opponents.

Setup: all four players receive 4 cards. Four cards are dealt face-up in the center. The goal is to secretly build 4-of-a-kind in your hand, then signal your partner to shout "KEMPS!" for a point.

Swapping: click one of your cards to select it, then click a center card to swap them. There is no turn order — swapping is fast and continuous. The bots swap cards automatically. Try to collect four cards of the same rank.

Signaling: when you believe your partner (or you yourself) has 4-of-a-kind, click Signal Partner. Your bot partner will immediately check their hand and call KEMPS if they have it. If they don't have 4-of-a-kind, you lose the round — opponents score.

Stop-KEMPS: if you think an opponent has 4-of-a-kind and is about to signal their partner, click Stop-KEMPS. If you're right, your team scores. If wrong, opponents score.

Opponents also call KEMPS automatically when they collect 4-of-a-kind and their bot partner responds.

Winning: first team to win the target number of rounds (3 or 5) wins the match.

Tips: aim for the rank you already have most of in your opening hand. Watch the center for duplicate ranks you need.`,
  settings: kempsSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-kemps-action"]', pulses: 3 }; },
  component: Kemps,
};
