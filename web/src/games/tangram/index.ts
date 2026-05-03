import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TangramState, TangramAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TangramGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TangramGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const tangramPlugin: GamePlugin<TangramState, TangramAction, typeof settings> = {
  id: "tangram",
  title: "Tangram",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Arrange 7 classic tangram pieces to fill a target outline on a grid.",
  howToPlay: `Tangram is a classic Chinese puzzle using seven geometric pieces: two large triangles, one medium triangle, two small triangles, one square, and one parallelogram. Your goal is to arrange all seven pieces to fit exactly within the shaded target outline on the 10×10 grid.

Select a piece from the piece list on the right. A colored preview follows your cursor over the grid. Click any cell to place the piece at that position (top-left anchor). Use the Rotate button to cycle through four 90-degree rotations before placing.

To reposition a piece, click its name in the piece list again (while it's placed) to remove it and re-select it for re-placement.

Pieces cannot overlap each other or extend outside the grid. The shaded cells on the grid show the target silhouette — all pieces must fill exactly those cells to win.

Win condition: all 7 pieces placed such that the combined footprint exactly matches the target outline. Score: 500 points on completion.

Tips: start with the large triangles as they constrain the layout most. The parallelogram often fits in the tightest remaining space. Rotation is key — try all four orientations before giving up on a placement. Work from corners inward.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".tangram-btn", pulses: 3 }; },
  component: TangramGame,
};
