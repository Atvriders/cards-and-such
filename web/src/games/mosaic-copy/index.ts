import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MosaicCopyState, MosaicCopyAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MosaicCopy = /* @__PURE__ */ lazy(() => import("./MosaicCopy.js").then((mod) => ({ default: mod.MosaicCopy as unknown as React.ComponentType<unknown> })));
export const mosaicCopySettings = {} as const;

export const mosaicCopyPlugin: GamePlugin<MosaicCopyState, MosaicCopyAction, typeof mosaicCopySettings> = {
  id: "mosaic-copy",
  title: "Mosaic Copy",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Memorize the tile pattern, then recreate it from memory.",
  howToPlay: `Mosaic Copy is a visual memory game played on a 4x4 grid. At the start of each round, a pattern of highlighted tiles is revealed on the grid. You have a few seconds to study it. Then the pattern disappears and it is your turn to recreate it by clicking the tiles you remember.

Press Start to see the pattern. Study it carefully — pay attention to which tiles are lit and try to remember their positions. When the grid goes dark, click each tile you think was part of the pattern. You can click again to deselect a tile if you change your mind. When you are confident in your selection, press Submit.

If your selection exactly matches the original pattern, you advance to the next round — which will have more tiles to memorize. A wrong submission ends the game and your score is the number of rounds you successfully completed.

The number of tiles in the pattern grows with each round, starting at 3 tiles and increasing as you progress. Tips: Look for geometric shapes in the pattern rather than memorizing individual cells. Relate the lit tiles to recognizable shapes like an L, a diagonal, a cross, or a corner. Scan the grid in rows — "top row has left and right lit, middle row has center lit" — then recall the same way. With practice you will develop quick visual pattern-capture that works for increasingly complex mosaics.`,
  settings: mosaicCopySettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-mosaic-copy-action"]', pulses: 3 }; },
  component: MosaicCopy,
};
