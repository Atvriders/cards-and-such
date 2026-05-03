import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { UrState, UrAction, UrSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Ur = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Ur as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const royalGameOfUrPlugin: GamePlugin<UrState, UrAction, typeof settings> = {
  id: "royal-game-of-ur",
  title: "Royal Game of Ur",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "2500 BCE Mesopotamian race game — throw tetrahedral dice and race 7 pieces to safety.",
  howToPlay: `The Royal Game of Ur is one of the world's oldest known board games, discovered in the Royal Tombs of Ur (modern Iraq) and dating to around 2500 BCE. You race 7 gold pieces against the bot's 7 dark pieces along a 14-step track.

Each turn, click Roll Dice. Four binary tetrahedral dice determine your move (0-4). You may also roll from pieces waiting off the board (entering at step 1). Click a highlighted piece to move it forward by the rolled amount.

The track has a private start zone (steps 1-4), a shared combat zone (steps 5-12), and a private exit zone (steps 13-14). In the shared zone, you may land on and send an opponent's piece back to start. The rosette squares (marked ★ at steps 4, 8, and 14) grant an extra turn when landed on. The rosette at step 8 is also a safe square — pieces there cannot be captured.

A piece escapes off the board when moved to exactly step 15 (rolled exactly the right distance from step 14). First player to escape all 7 pieces wins.

The bot plays a greedy strategy, prioritizing captures, rosette landings, and escaping pieces.`,
  settings,
  initialState: (seed: number, s: UrSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-royal-game-of-ur-action"]', pulses: 3 }; },
  component: Ur,
};
