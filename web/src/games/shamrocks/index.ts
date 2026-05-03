import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ShamrocksState, ShamrocksAction, ShamrocksSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Shamrocks } from "./Shamrocks.js";

export const shamrocksSettings = {} as const;

export const shamrocksPlugin: GamePlugin<ShamrocksState, ShamrocksAction, typeof shamrocksSettings> = {
  id: "shamrocks",
  title: "Shamrocks",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pile all 52 cards onto four foundations using adjacent-rank tableau moves.",
  howToPlay: `Shamrocks is a patience game named for its three-leaf layout — nearly every pile holds exactly three cards.

Setup: All 52 cards are dealt face-up into 18 tableau piles: 17 piles of 3 cards and 1 pile of 1 card. Four empty foundation piles wait above.

Goal: Move all cards onto the four foundations, built up by suit from Ace to King.

Tableau moves: You may move only the top card of any pile. A card may be placed on a tableau pile if its rank is adjacent (one higher or one lower, wrapping so Ace is next to King). No suit restrictions apply on the tableau. Critically, no pile may hold more than 3 cards.

Foundation moves: Move an Ace to start a foundation, then continue building that suit in ascending order (A, 2, 3 … K).

Strategy: The three-card limit creates the core tension. Avoid locking useful cards under mismatched stacks. Plan a clear path to the foundations — a pile capped at three cards with no useful neighbors can become permanently stuck. Clearing piles entirely gives you valuable empty spaces to maneuver through.`,
  settings: shamrocksSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-shamrocks-action"]', pulses: 3 }; },
  component: Shamrocks,
};
