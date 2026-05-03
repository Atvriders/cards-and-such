import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CathedralState, CathedralAction, CathedralSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CathedralGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CathedralGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const cathedralGamePlugin: GamePlugin<CathedralState, CathedralAction, typeof settings> = {
  id: "cathedral-game",
  title: "Cathedral",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place building pieces on a 10×10 board to claim the most territory.",
  howToPlay: `Cathedral is a two-player abstract territory game inspired by the medieval English city of Lincoln. Played on a 10×10 board, the game opens with the cathedral piece — a five-cell cross — already placed near the centre.

You play as Blue. The bot plays as Red. Each player has a set of six polyomino building pieces of varying sizes and shapes: rectangles, L-shapes, T-shapes, and more. Players alternate placing one piece per turn anywhere on the board where it fits without overlapping other pieces or the cathedral.

To place a piece: select it from the sidebar panel, optionally rotate it using the Rotate button, then click the target cell on the board. A blue highlight shows where your piece will land if the placement is valid.

Once all pieces have been placed (or no piece can fit), the game ends. Count the cells occupied by your pieces — the player who has claimed more cells wins. A draw is possible.

Strategy: claim large connected areas in the corners and edges early. Smaller pieces are useful for filling gaps and blocking the bot. Watch for spaces the bot is trying to complete and drop a piece to deny them. Larger pieces score more territory but are harder to place later in the game.`,
  settings,
  initialState: (seed: number, s: CathedralSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".rotate-btn", pulses: 3 }; },
  component: CathedralGame,
};
