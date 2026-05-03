import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BridgeState, BridgeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BridgeBuilderPuzzle = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BridgeBuilderPuzzle as unknown as React.ComponentType<unknown> })));
export const bridgeBuilderPuzzlePlugin = {
  id: "bridge-builder-puzzle",
  title: "Bridge Builder",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place wooden planks to build a path from A to B across a rocky riverbed. Use planks wisely — you have a limited supply!",
  howToPlay: `Bridge Builder is a grid-based logic puzzle. A 7×5 grid represents a rocky riverbed with a bank on each side. Your goal is to place planks on empty cells to create a connected path from the Start cell (A) to the End cell (B).

The grid contains three types of fixed cells: Start (A) on the left edge, End (B) on the right edge, and Rocks that cannot be crossed. You must route your bridge around the rocks using the planks you have.

You begin each puzzle with 8 planks. Click any empty cell to place a plank there. Click a plank again to remove it and reclaim it for use elsewhere. You can rearrange planks freely until you run out of moves.

A path is valid if any walkable route (including start, empty, and plank cells) connects A to B. Once connected, the puzzle is solved automatically and you earn a score based on how few moves you used.

If you place all planks without connecting the banks, the puzzle is lost — but you can click New Puzzle for a fresh layout at any time.

Strategy: Look at both the start and end rows, then plan a route that minimizes turns. Straightline paths use the fewest planks. Reserve extra planks for tricky routing around rocks.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: BridgeState, action: BridgeAction) => BridgeState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-bridge-builder-puzzle-action"]', pulses: 3 }; },
  component: BridgeBuilderPuzzle,
} as unknown as GamePlugin;
