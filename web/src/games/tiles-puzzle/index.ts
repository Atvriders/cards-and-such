import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { tilesPuzzleState, tilesPuzzleAction, tilesPuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const tilesPuzzleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.tilesPuzzleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tilesPuzzlePlugin: GamePlugin<tilesPuzzleState, tilesPuzzleAction, typeof settings> = {
  id: "tiles-puzzle",
  title: "NYT Tiles",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Rearrange tiles into target arrangement — fifteen pattern-matching rounds.",
  howToPlay: "NYT Tiles is a tile-rearrangement puzzle distilled to fifteen pattern-matching rounds. Each round shows a partial tile pattern and asks you to identify which arrangement completes it.\n\nThe pool of tile-pattern challenges includes Three squares aligned vertically, Two diamonds crossing in middle, Star-pattern formed by four arrows, and other classic Tiles arrangements. Each correct answer scores ten points; max 150.\n\nClick an arrangement, press Submit to lock, then Next to advance. The original NYT Tiles is a daily puzzle requiring rearrangement of tiles within a move limit to match a target; this distillation preserves the pattern-recognition focus without the swap-and-match mechanic. Strong pattern-spotters score 130+; visual-spatial experts hit perfect 150.\n\nUse it as a quick visual-puzzle warmup or a calmer alternative to the daily NYT app. The key skill is reading the target pattern and matching the candidate that fills in correctly.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as tilesPuzzleSettings),
  reducer,
  isTerminal,
  
  hint: (state: tilesPuzzleState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-tiles-puzzle-answer-0"]', pulses: 3 } : null,component: tilesPuzzleGame,
};
