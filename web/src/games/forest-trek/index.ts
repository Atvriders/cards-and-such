import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForestTrekState, ForestTrekAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ForestTrek = /* @__PURE__ */ lazy(() => import("./ForestTrek.js").then((mod) => ({ default: mod.ForestTrek as unknown as React.ComponentType<unknown> })));
export const forestTrekSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["5", "6", "7"] as const,
    default: "5" as const,
  },
} as const;

type ForestTrekSettingsType = SettingsOf<typeof forestTrekSettings>;

export const forestTrekPlugin: GamePlugin<ForestTrekState, ForestTrekAction, typeof forestTrekSettings> = {
  id: "forest-trek",
  title: "Forest Trek",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate through a forest grid from start to finish, avoiding trees.",
  howToPlay: `Forest Trek is a grid navigation board game. You control a hiker (🧭) who must travel from the home tile (🏠) in the top-left corner to the finish flag (🏁) in the bottom-right corner.

The forest grid is filled with different terrain types. Empty green path cells are free to walk through. Tree cells (🌲) are solid obstacles — you cannot enter them. River cells (🌊) can be crossed but each river crossing costs two moves instead of one. The start and end tiles are always clear.

Use the arrow buttons — Up, Down, Left, Right — to move one cell at a time. You cannot move off the edge of the grid. Plan your route carefully before committing, since every move counts toward your final score.

Scoring: you begin with 1000 points and lose points for each move taken. River crossings count as two moves. Reaching the finish with fewer total moves earns a higher score. A direct optimal route on the 5×5 grid takes roughly 8 moves; on 7×7 about 12–14. Aim to find the shortest clear path.

Tips: scan the grid before moving and identify tree clusters early. If a river lies on the shortest path, check whether going around it costs fewer total moves. Visited cells are dimmed so you can track your route. Press New Trek at any time to restart with a freshly generated map.`,
  settings: forestTrekSettings,
  initialState: (seed: number, settings: ForestTrekSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-forest-trek-action"]', pulses: 3 }; },
  component: ForestTrek,
};
