import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { nytMiniCrossState, nytMiniCrossAction, nytMiniCrossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const nytMiniCrossGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.nytMiniCrossGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const nytMiniCrossPlugin: GamePlugin<nytMiniCrossState, nytMiniCrossAction, typeof settings> = {
  id: "nyt-mini-cross",
  title: "NYT Mini Crossword",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5x5 mini crossword — solve a single clue per round, fifteen rounds.",
  howToPlay: "NYT Mini Crossword is a quick crossword distilled to fifteen single-clue rounds. Each round presents a crossword clue and asks you to identify the answer from four candidate words.\n\nThe pool of mini-crossword clues includes Cat sound (MEOW), Big sea (OCEAN), Capital of France (PARIS), Pet that purrs (CAT), Largest planet (JUPITER), and other short-fill puzzle clues. Each correct answer scores ten points; max 150.\n\nClick a candidate word, press Submit to lock, then Next to advance. The original NYT Mini is a 5x5 grid solved by clue-by-clue interaction with cross-checking; this distillation captures the clue-recognition aspect without the grid-fill mechanic. Strong solvers score 130+; word enthusiasts hit perfect 150.\n\nUse it as a quick crossword warmup or a coffee-break puzzle. Read each clue, visualise the grid space, and pick the right word.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as nytMiniCrossSettings),
  reducer,
  isTerminal,
  
  hint: (state: nytMiniCrossState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-nyt-mini-cross-answer-0"]', pulses: 3 } : null,component: nytMiniCrossGame,
};
