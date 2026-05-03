import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { LigrettoState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Ligretto = /* @__PURE__ */ lazy(() => import("./Ligretto.js").then((mod) => ({ default: mod.Ligretto as unknown as React.ComponentType<unknown> })));
export const ligrettoSettings = {
  botSpeed: {
    kind: "enum" as const,
    label: "Bot Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type LigrettoAction =
  | { type: "play-ligretto-to-center" }
  | { type: "play-row-to-center"; rowIdx: number }
  | { type: "play-hand-to-center" }
  | { type: "play-ligretto-to-row"; rowIdx: number }
  | { type: "flip-hand" }
  | { type: "bot-tick" }
  | { type: "restart" };

export const ligrettoPlugin: GamePlugin<LigrettoState, LigrettoAction, typeof ligrettoSettings> = {
  id: "ligretto",
  title: "Ligretto",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race to empty your Ligretto pile by playing color-coded cards 1-10 to shared center piles.",
  howToPlay: `Ligretto is a fast, real-time card game where you race a bot to empty your Ligretto pile.

Setup: each player has a colored deck with ranks 1 through 10 in four colors. Your Ligretto pile holds 10 cards. Three Row cards are placed face-up in front of you. Your remaining cards form your Hand draw pile.

Center piles are shared. Each of the four colors (red, blue, green, yellow) builds its own center pile starting from 1 up to 10. Any player may play to any center pile at any time.

Your moves: click the top card of your Ligretto pile to play it to center (if it's next in sequence for that color). Click a Row card to play it to center. If a Row slot is empty, click it — or click the empty slot — to move your Ligretto top card there, exposing the next card. Click your Hand pile to flip a new card; the face-up card can be played to center if valid.

Bot: plays automatically at the chosen tick rate.

Winning: first to empty their Ligretto pile wins. Score equals 100 minus any remaining Ligretto cards. The bot wins if it empties its pile first.

Tips: focus on getting your 1s to center fast — they unlock the whole color sequence. Use empty Row slots to cycle through your Ligretto pile quickly. Flip your Hand often to find useful cards.`,
  settings: ligrettoSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-ligretto-action"]', pulses: 3 }; },
  component: Ligretto,
};
