import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { perplexusMazeState, perplexusMazeAction, perplexusMazeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const perplexusMazeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.perplexusMazeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const perplexusMazePlugin: GamePlugin<perplexusMazeState, perplexusMazeAction, typeof settings> = {
  id: "perplexus-maze",
  title: "Perplexus",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ball-maze inside a sphere — navigate without falling, fifteen visual-spatial puzzles.",
  howToPlay: "Perplexus is a 3D ball-maze observation game distilled to fifteen path-recognition rounds. Each round presents a partial maze segment and asks you to identify the correct path forward.\n\nThe pool of maze-path challenges includes Curving track left-right, Drop-and-roll down two stages, Tilt-balance hold five seconds, and other classic Perplexus traversal patterns. Each correct answer scores ten points; max 150 total.\n\nClick a path, press Submit to lock, then Next to advance. There's no timer — read each maze segment carefully and visualise the marble's journey before choosing.\n\nThe original Perplexus is a tactile ball-in-sphere puzzle requiring physical dexterity. This distillation preserves the path-finding observation without the manipulation challenge — your eyes do the work, not your hands. Strong path-spotters score 130+; visual-spatial wizards hit perfect 150.\n\nUse it as a quick spatial-reasoning warmup or as a calmer version of the original 3D maze puzzle.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as perplexusMazeSettings),
  reducer,
  isTerminal,
  
  hint: (state: perplexusMazeState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-perplexus-maze-answer-0"]', pulses: 3 } : null,component: perplexusMazeGame,
};
