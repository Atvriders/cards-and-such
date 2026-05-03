import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { CorralMiniState, CorralMiniAction, CorralMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CorralMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CorralMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const corralMiniPlugin: GamePlugin<CorralMiniState, CorralMiniAction, typeof settings> = {
  id: "corral-mini",
  title: "Corral Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw a loop; numbers show line-of-sight count in interior cells.",
  howToPlay: "Corral (also called Courtyard) is a loop-drawing puzzle. The grid contains numbered cells; each number indicates the count of cells visible (orthogonally) from that cell in the four cardinal directions, counting itself. The loop boundary blocks line of sight.\n\nGoal: draw a single closed loop along grid edges so all numbered cells lie inside the loop and each numbered cell's visibility count matches its clue.\n\nIn this mini version each puzzle shows a partial loop drawn around a small grid with one or two clue numbers. The prompt asks where the loop must turn next or whether a specific cell can be inside or outside.\n\nSix puzzles per round, scoring 100 per correct answer with a 10-point time bonus per remaining second. Wrong picks reveal the right answer.\n\nCorral's beauty is that the loop-shape itself is the answer; clue numbers force specific bends and walls. Start with the largest clue (maximum visibility cells) and the smallest (most restricted). Patterns emerge quickly: a clue of 5 in a row of 4 cells means the loop must extend visibility into a column.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as CorralMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: CorralMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-corral-mini-answer-0"]', pulses: 3 } : null,component: CorralMiniGame,
};
