import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DutchBlitzState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DutchBlitz = /* @__PURE__ */ lazy(() => import("./DutchBlitz.js").then((mod) => ({ default: mod.DutchBlitz as unknown as React.ComponentType<unknown> })));
export const dutchBlitzSettings = {
  botSpeed: {
    kind: "enum" as const,
    label: "Bot Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
  strictColors: {
    kind: "boolean" as const,
    label: "Strict Colors",
    default: false,
  },
} as const;

type DutchBlitzAction =
  | { type: "play-blitz-to-center"; centerIdx: number }
  | { type: "play-post-to-center"; postIdx: number; centerIdx: number }
  | { type: "play-wood-to-center"; centerIdx: number }
  | { type: "play-blitz-to-post"; postIdx: number }
  | { type: "play-wood-to-post"; postIdx: number }
  | { type: "flip-wood" }
  | { type: "bot-tick" }
  | { type: "restart" };

export const dutchBlitzPlugin: GamePlugin<DutchBlitzState, DutchBlitzAction, typeof dutchBlitzSettings> = {
  id: "dutch-blitz",
  title: "Dutch Blitz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race to empty your Blitz pile by playing cards to shared center piles before the bot does.",
  howToPlay: `Dutch Blitz is a fast-paced real-time card game where you race a bot to empty your Blitz pile.

Setup: each player receives a 40-card colored deck (ranks 1-10 in four colors). Your Blitz pile holds 10 cards face-down; three Post piles hold one card each face-up; the remaining cards form your Wood pile draw stack.

Center piles are shared. Any player may start a new center pile by playing a 1 of any color. Once started, a center pile builds upward 1-2-3...10 in the same color.

Your turn (continuous): click a card from your Blitz pile, a Post pile, or your Wood hand to select it — it highlights. Then click a valid center pile to play it, or click a Post pile to stack it there (must be one rank lower). Click your Wood draw pile to flip a new card into your hand.

Bot: the bot plays automatically on a timer. Slow bots give you more time to react; fast bots are relentless.

Winning: first player to empty their Blitz pile wins. Your score reflects how quickly you cleared it. Leftover Blitz cards reduce your score.

Tips: always scan center piles for your Blitz top card first — playing from Blitz counts most. Use Post piles as temporary storage. Flip Wood often to expose new playable cards.`,
  settings: dutchBlitzSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-dutch-blitz-action"]', pulses: 3 }; },
  component: DutchBlitz,
};
