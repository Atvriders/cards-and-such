import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveCrownsState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FiveCrowns = /* @__PURE__ */ lazy(() => import("./FiveCrowns.js").then((mod) => ({ default: mod.FiveCrowns as unknown as React.ComponentType<unknown> })));
export const fiveCrownsSettings = {
  botCount: {
    kind: "number" as const,
    label: "Bots",
    min: 1,
    max: 3,
    step: 1,
    default: 3,
  },
} as const;

type FiveCrownsSettingsType = SettingsOf<typeof fiveCrownsSettings>;

type FiveCrownsAction =
  | { type: "draw"; from: "stock" | "discard" }
  | { type: "discard"; cardId: string }
  | { type: "go-out" };

export const fiveCrownsPlugin: GamePlugin<FiveCrownsState, FiveCrownsAction, typeof fiveCrownsSettings> = {
  id: "five-crowns",
  title: "Five Crowns",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5-suit rummy with wild cards (starts with 3s). Meld fast to minimize your deadwood.",
  howToPlay: `Five Crowns is a rummy-style card game where 3s are wild and your goal is to be the first to meld your entire hand.

Wild Cards: All 3s (and jokers in this version) are wild — they can substitute for any card in a meld. Wild cards are shown with a golden glow.

Melds: Sets are 3+ cards of the same rank (different suits). Runs are 3+ consecutive cards of the same suit. Wild cards can fill gaps in either type of meld.

On Your Turn: Draw one card — either from the top of the stock (face down) or the top of the discard pile. Then discard one card from your hand by clicking it.

Going Out: When your hand has 0 deadwood (all cards are in valid melds), click "Go Out!" instead of discarding. The round ends, and all other players' unmelded card values are their scores (lower is better for them).

Deadwood: Cards not part of any meld count as deadwood. Face cards = 10 pts, Aces = 1 pt, others = face value. Wild cards (3s) always count as 0 deadwood.

Your score improves based on how much deadwood your opponents have when you go out versus your own — going out with 0 and opponents holding high cards is the ideal outcome.

Controls: Click the stock (face-down pile) or discard pile to draw. During your discard phase, click a card in your hand to discard it. Click "Go Out!" when deadwood is 0.`,
  settings: fiveCrownsSettings,
  initialState: (seed: number, settings: FiveCrownsSettingsType) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-five-crowns-action"]', pulses: 3 }; },
  component: FiveCrowns,
};
