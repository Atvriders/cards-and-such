import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SetState, SetAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SetGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SetGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const setGamePlugin: GamePlugin<SetState, SetAction, typeof settings> = {
  id: "set-game",
  title: "Set",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find groups of 3 cards where each attribute is all-same or all-different.",
  howToPlay: `Set is a pattern-recognition card game. Each card has four attributes — color (red, green, purple), shape (oval, diamond, squiggle), fill (empty, striped, solid), and count (1, 2, or 3 symbols).

A "SET" is a group of exactly 3 cards where every attribute is either all the same across all 3 cards or all different across all 3 cards. No attribute can have two cards matching and one different.

12 cards are dealt face-up. Click 3 cards to select them. If they form a valid SET, they are removed and replaced from the deck. If not, an error is shown and your selection resets.

The game ends when all cards are cleared from the table (perfect win) or when no SETs remain on the table with an empty deck (partial score).

Score: 100 points per SET found.

Use the Hint button to highlight the first card of a valid SET on the table if you're stuck — this helps you learn what to look for without fully giving away the answer.

Tips: start by scanning for all-different cards on each attribute — they are common. Then look for all-same. The most common mistake is finding two cards that match and forcing a third that breaks one attribute. Check all four attributes carefully before clicking.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-set-game-action"]', pulses: 3 }; },
  component: SetGame,
};
