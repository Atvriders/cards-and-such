import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { NertzState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Nertz = /* @__PURE__ */ lazy(() => import("./Nertz.js").then((mod) => ({ default: mod.Nertz as unknown as React.ComponentType<unknown> })));
export const nertzSettings = {
  botSpeed: {
    kind: "enum" as const,
    label: "Bot Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type NertzAction =
  | { type: "play-nertz-to-center" }
  | { type: "play-river-to-center"; riverIdx: number }
  | { type: "play-stream-to-center" }
  | { type: "play-nertz-to-river"; riverIdx: number }
  | { type: "play-river-to-river"; fromIdx: number; toIdx: number }
  | { type: "play-stream-to-river"; riverIdx: number }
  | { type: "flip-stream" }
  | { type: "bot-tick" }
  | { type: "restart" };

export const nertzPlugin: GamePlugin<NertzState, NertzAction, typeof nertzSettings> = {
  id: "nertz",
  title: "Nertz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Racing Solitaire — empty your Nertz pile to the shared center before the bot does.",
  howToPlay: `Nertz (also called Pounce or Racing Solitaire) is a real-time two-player card game using two full decks.

Setup: each player receives a full 52-card deck with distinct backs. Your Nertz pile holds 12 cards face-down — this is what you must empty to win. Four River piles hold one card each face-up and are yours alone. Your remaining cards form the Stream draw pile.

Center piles are shared by both players. Each suit (♠ ♥ ♦ ♣) has its own center pile that builds up from Ace to King. Anyone can play to any center pile at any time.

Your moves: click a card to select it (it highlights), then click a destination. Nertz pile top, River pile tops, and Stream hand are all selectable. River piles build down in alternating color (red on black). Stream: click the face-down pile to flip 3 cards; only the top card of your hand is playable.

Bot: the bot plays its own deck simultaneously at the chosen speed, racing you to empty its Nertz pile.

Winning: first player to empty their Nertz pile calls "Nertz!" and wins. Score is calculated from cards placed in the center minus a penalty for remaining Nertz cards.

Tips: always check if your Nertz top card can go straight to center — that's the fastest path. Unblock your Nertz pile by moving River cards to center first.`,
  settings: nertzSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-nertz-action"]', pulses: 3 }; },
  component: Nertz,
};
