import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Go9x9State, Go9x9Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Go9x9 = /* @__PURE__ */ lazy(() => import("./Go9x9.js").then((mod) => ({ default: mod.Go9x9 as unknown as React.ComponentType<unknown> })));
export const go9x9Settings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot", "hot-seat"] as const,
    default: "bot",
  },
} as const;

type Go9x9SettingsType = SettingsOf<typeof go9x9Settings>;

export const go9x9Plugin: GamePlugin<Go9x9State, Go9x9Action, typeof go9x9Settings> = {
  id: "go-9x9",
  title: "Go 9×9",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "Classic Go on a 9×9 board. Surround territory and capture stones.",
  howToPlay: `Go is one of the oldest strategy games in the world. This version uses a simplified 9×9 board with standard rules, minus ko (repetition) detection.

You play as Black; the bot plays as White. Black places first. On each turn, place a stone on any empty intersection. A group of stones (connected orthogonally) with no adjacent empty points (liberties) is captured and removed. You may not place a stone that would have zero liberties after captures.

Pass your turn when you have no useful moves. Two consecutive passes end the game. Score is computed as: stones on the board + empty territory surrounded entirely by your color, minus captured stones you have lost. White receives 6.5 komi points (compensation for moving second).

Ko (the rule preventing immediate board repetition) is not enforced in this simplified version. Seki (mutual life) positions are treated as neutral territory.

The bot uses a two-move minimax with territory evaluation. Strategy: occupy corners and edges early, then build walls to surround territory.`,
  settings: go9x9Settings,
  initialState: (seed: number, settings: Go9x9SettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-go-9x9-action"]', pulses: 3 }; },
  component: Go9x9,
};
